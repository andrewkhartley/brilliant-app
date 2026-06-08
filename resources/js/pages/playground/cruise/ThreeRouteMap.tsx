import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';

import { useTranslation } from '@/hooks/useTranslation';

import type { Leg, MapOrbitPath } from './types';

export interface RouteMapPoint {
    code: string;
    elapsedDays: number;
    name: string;
    x: number;
    y: number;
    z: number;
    radiusKm: number;
}

interface ThreeRouteMapProps {
    fallback: ReactNode;
    legs: Leg[];
    orbitPaths: MapOrbitPath[];
    planetPositions: RouteMapPoint[];
    points: RouteMapPoint[];
    tripStart: string;
}

interface PlanetStyle {
    code: string;
    name: string;
    color: number;
    size: number;
}

interface OrbitTrack {
    code: string;
    name: string;
    periodDays: number;
    points: OrbitTrackPoint[];
    style: PlanetStyle;
}

interface OrbitTrackPoint {
    elapsedDays: number;
    position: THREE.Vector3;
}

type FlightPhase = 'acceleration' | 'cruise' | 'deceleration' | 'layover';
type VisibleFlightPhase = Exclude<FlightPhase, 'layover'>;

interface TimelineSegment {
    endProgress: number;
    endSeconds: number;
    label: FlightPhase;
    legIndex: number;
    routeEnd: number;
    routeStart: number;
    startProgress: number;
    startSeconds: number;
}

interface LegSegment {
    end: THREE.Vector3;
    start: THREE.Vector3;
}

interface PhaseRouteLine {
    color: number;
    end: number;
    start: number;
}

const AU_KM = 149_597_870.7;
const MAX_AU = 30.1;
const ORBIT_SCALE = 15.5;
const PLANET_STYLES: PlanetStyle[] = [
    { code: 'mer', name: 'Mercury', color: 0xb8b1a4, size: 0.09 },
    { code: 'ven', name: 'Venus', color: 0xe8c27a, size: 0.13 },
    { code: 'ear', name: 'Earth', color: 0x67e8f9, size: 0.14 },
    { code: 'mar', name: 'Mars', color: 0xf97316, size: 0.12 },
    { code: 'jup', name: 'Jupiter', color: 0xf6d7a8, size: 0.24 },
    { code: 'sat', name: 'Saturn', color: 0xfacc15, size: 0.21 },
    { code: 'ura', name: 'Uranus', color: 0x7dd3fc, size: 0.18 },
    { code: 'nep', name: 'Neptune', color: 0x60a5fa, size: 0.18 },
    { code: 'cer', name: 'Ceres', color: 0xd6d3d1, size: 0.08 },
    { code: 'ves', name: 'Vesta', color: 0xf5deb3, size: 0.07 },
];

const SECONDS_PER_DAY = 86400;
const SECONDS_PER_HOUR = 3600;
const SIMULATION_SPEEDS = [
    SECONDS_PER_HOUR,
    SECONDS_PER_HOUR * 6,
    SECONDS_PER_DAY,
    SECONDS_PER_DAY * 3,
    SECONDS_PER_DAY * 7,
    SECONDS_PER_DAY * 30,
];
const MIN_SIMULATION_DAYS_PER_SECOND = 1 / 24;
const MAX_SIMULATION_DAYS_PER_SECOND = 120;
const FLIGHT_PHASE_STYLES: Array<{
    activeClass: string;
    color: number;
    key: VisibleFlightPhase;
}> = [
    {
        activeClass: 'border-cyan-200/50 bg-cyan-200/18 text-cyan-100',
        color: 0x67e8f9,
        key: 'acceleration',
    },
    {
        activeClass: 'border-amber-200/50 bg-amber-200/18 text-amber-100',
        color: 0xfbbf24,
        key: 'cruise',
    },
    {
        activeClass: 'border-rose-200/50 bg-rose-200/18 text-rose-100',
        color: 0xfda4af,
        key: 'deceleration',
    },
];

export function ThreeRouteMap({
    fallback,
    legs,
    orbitPaths,
    planetPositions,
    points,
    tripStart,
}: ThreeRouteMapProps) {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const activePointNameRef = useRef(points[0]?.name ?? '');
    const simulationProgressRef = useRef(0);
    const simulationSpeedRef = useRef(SIMULATION_SPEEDS[1]);
    const isPlayingRef = useRef(true);
    const [webglFailed, setWebglFailed] = useState(false);
    const [activePointName, setActivePointName] = useState(points[0]?.name ?? '');
    const [currentPhase, setCurrentPhase] = useState<FlightPhase>('acceleration');
    const [isPlaying, setIsPlaying] = useState(true);
    const [showMobileSpeedControls, setShowMobileSpeedControls] =
        useState(false);
    const [showMobileTimelineControls, setShowMobileTimelineControls] =
        useState(false);
    const [simulationProgress, setSimulationProgress] = useState(0);
    const [simulationSpeed, setSimulationSpeed] = useState(SIMULATION_SPEEDS[1]);
    const routePoints = useMemo(() => normalizeRoutePoints(points), [points]);
    const legSegments = useMemo(() => buildLegSegments(routePoints), [routePoints]);
    const timeline = useMemo(() => buildTimeline(legs), [legs]);
    const totalSeconds = timeline.at(-1)?.endSeconds ?? 0;

    function updateProgress(nextProgress: number) {
        const clamped = clamp(nextProgress, 0, 1);
        simulationProgressRef.current = clamped;
        setSimulationProgress(clamped);
    }

    function updatePlaying(nextPlaying: boolean) {
        isPlayingRef.current = nextPlaying;
        setIsPlaying(nextPlaying);
    }

    function updateSpeed(nextSpeed: number) {
        simulationSpeedRef.current = nextSpeed;
        setSimulationSpeed(nextSpeed);
    }

    function togglePlaying() {
        setIsPlaying((current) => {
            const nextPlaying = !current;

            isPlayingRef.current = nextPlaying;

            return nextPlaying;
        });
    }

    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas === null || legSegments.length === 0) {
            return;
        }

        const activeCanvas = canvas;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
        camera.position.set(0, -32, 22);
        camera.lookAt(0, 0, 0);

        let renderer: THREE.WebGLRenderer;

        try {
            renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true,
                canvas: activeCanvas,
            });
        } catch {
            window.setTimeout(() => setWebglFailed(true), 0);

            return;
        }

        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const root = new THREE.Group();
        root.rotation.x = -0.48;
        scene.add(root);

        root.add(createStarfield());
        root.add(createSun());

        const orbitTracks = buildOrbitTracks(orbitPaths, planetPositions, points);
        const planetMeshes: Array<{ mesh: THREE.Mesh; track: OrbitTrack }> = [];

        for (const track of orbitTracks) {
            const orbit = createOrbitLine(track);
            root.add(orbit);

            const marker = createPlanetMarker(track.style);
            marker.position.copy(positionForTrack(track, 0));
            root.add(marker);
            planetMeshes.push({ mesh: marker, track });
        }

        legSegments.forEach((segment, index) => {
            const phaseLines = createRoutePhaseLines(
                segment,
                phaseRouteLinesForLeg(legs[index]),
            );

            phaseLines.forEach((routeLine) => root.add(routeLine));
        });

        const routeMarkers = points.map((_, index) => {
            const marker = createRouteMarker(index === 0);
            marker.position.copy(routePoints[index]);
            root.add(marker);

            return marker;
        });

        const ship = createShip();
        root.add(ship);

        const ambient = new THREE.AmbientLight(0x8ecae6, 1.4);
        const pointLight = new THREE.PointLight(0xfff3bf, 3.2, 80);
        pointLight.position.set(0, 0, 7);
        scene.add(ambient, pointLight);

        const resize = () => {
            const rect = activeCanvas.getBoundingClientRect();
            const width = Math.max(rect.width, 1);
            const height = Math.max(rect.height, 1);

            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };
        resize();

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(activeCanvas);

        let lastFrameTime = performance.now();
        let running = true;
        let dragStart: { x: number; y: number; rotationZ: number; rotationX: number } | null = null;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const onPointerDown = (event: PointerEvent) => {
            dragStart = {
                x: event.clientX,
                y: event.clientY,
                rotationZ: root.rotation.z,
                rotationX: root.rotation.x,
            };
            activeCanvas.setPointerCapture(event.pointerId);
        };
        const onPointerMove = (event: PointerEvent) => {
            if (dragStart === null) {
                return;
            }

            root.rotation.z = dragStart.rotationZ + (event.clientX - dragStart.x) * 0.006;
            root.rotation.x = clamp(
                dragStart.rotationX + (event.clientY - dragStart.y) * 0.006,
                -Math.PI,
                Math.PI,
            );
        };
        const onPointerUp = (event: PointerEvent) => {
            dragStart = null;
            activeCanvas.releasePointerCapture(event.pointerId);
        };
        const onWheel = (event: WheelEvent) => {
            event.preventDefault();
            camera.position.z = clamp(camera.position.z + event.deltaY * 0.018, 13, 38);
            camera.position.y = -camera.position.z * 1.45;
            camera.lookAt(0, 0, 0);
        };

        activeCanvas.addEventListener('pointerdown', onPointerDown);
        activeCanvas.addEventListener('pointermove', onPointerMove);
        activeCanvas.addEventListener('pointerup', onPointerUp);
        activeCanvas.addEventListener('pointercancel', onPointerUp);
        activeCanvas.addEventListener('wheel', onWheel, { passive: false });

        const animate = () => {
            if (!running) {
                return;
            }

            const now = performance.now();
            const elapsedFrameSeconds = Math.min(
                (now - lastFrameTime) / 1000,
                0.1,
            );
            lastFrameTime = now;

            if (!reducedMotion && isPlayingRef.current && totalSeconds > 0) {
                const nextProgress =
                    simulationProgressRef.current
                    + (elapsedFrameSeconds * simulationSpeedRef.current)
                        / totalSeconds;
                simulationProgressRef.current = nextProgress >= 1 ? 0 : nextProgress;
            }

            const timelineState = resolveTimeline(
                timeline,
                simulationProgressRef.current,
            );
            const progress = timelineState.routeProgress;
            const legSegment =
                legSegments[timelineState.legIndex] ?? legSegments.at(-1);

            if (legSegment === undefined) {
                return;
            }

            const routePosition = legSegment.start
                .clone()
                .lerp(legSegment.end, progress);
            const tangent = legSegment.end.clone().sub(legSegment.start);
            const activeIndex = Math.min(
                points.length - 1,
                timelineState.legIndex * 2 + (progress >= 0.5 ? 1 : 0),
            );
            const nextActiveName = points[activeIndex]?.name ?? '';

            ship.position.copy(routePosition);
            orientShipToTravelLine(
                ship,
                tangent,
                timelineState.phase === 'deceleration',
            );
            ship.visible = timelineState.phase !== 'layover';

            if (activePointNameRef.current !== nextActiveName) {
                activePointNameRef.current = nextActiveName;
                setActivePointName(nextActiveName);
            }

            setCurrentPhase((previous) =>
                previous === timelineState.phase ? previous : timelineState.phase,
            );
            setSimulationProgress((previous) =>
                Math.abs(previous - simulationProgressRef.current) > 0.004
                    ? simulationProgressRef.current
                    : previous,
            );

            planetMeshes.forEach(({ mesh, track }) => {
                mesh.position.copy(
                    positionForTrack(
                        track,
                        timelineState.elapsedSeconds / 86400,
                    ),
                );
            });

            routeMarkers.forEach((marker, index) => {
                const pulse = reducedMotion
                    ? 1
                    : 1 + Math.sin(now * 0.0024 + index) * 0.08;
                marker.scale.setScalar(pulse);
            });

            renderer.render(scene, camera);
            window.requestAnimationFrame(animate);
        };

        animate();

        return () => {
            running = false;
            resizeObserver.disconnect();
            activeCanvas.removeEventListener('pointerdown', onPointerDown);
            activeCanvas.removeEventListener('pointermove', onPointerMove);
            activeCanvas.removeEventListener('pointerup', onPointerUp);
            activeCanvas.removeEventListener('pointercancel', onPointerUp);
            activeCanvas.removeEventListener('wheel', onWheel);
            disposeObject(scene);
            renderer.dispose();
        };
    }, [
        legSegments,
        legs,
        orbitPaths,
        planetPositions,
        points,
        routePoints,
        timeline,
        totalSeconds,
    ]);

    if (webglFailed || legSegments.length === 0) {
        return <>{fallback}</>;
    }

    const controlLabelKey = isPlaying
        ? 'cruise.review.map.controls.pause'
        : 'cruise.review.map.controls.play';
    const controlIcon = isPlaying ? 'fa-pause' : 'fa-play';

    return (
        <section>
            <div className="mb-5 max-w-4xl">
                <p className="text-xs font-semibold tracking-[0.22em] text-amber-200/82 uppercase">
                    {t('cruise.review.map.eyebrow')}
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-white">
                    {t('cruise.review.map.title')}
                </h2>
                <p className="mt-3 text-sm leading-7 text-cyan-50/72">
                    {t('cruise.review.map.body')}{' '}
                    {t('cruise.review.map.interactionHint')}
                </p>
            </div>

            <div className="relative overflow-hidden rounded border border-cyan-100/14 bg-slate-950/68 shadow-[0_22px_70px_rgba(8,17,31,0.38)]">
                <canvas
                    ref={canvasRef}
                    aria-label={t('cruise.review.map.ariaLabel')}
                    className="block aspect-16/10 w-full cursor-grab touch-none active:cursor-grabbing"
                />
                <div className="pointer-events-none absolute inset-x-2 top-2 flex items-center justify-center gap-2 rounded border border-cyan-100/14 bg-slate-950/72 px-2.5 py-1.5 text-center text-[0.66rem] font-semibold text-cyan-50/78 shadow-xl shadow-black/20 backdrop-blur md:hidden">
                    <span className="min-w-0 truncate text-white">
                        {activePointName || points[0]?.name}
                    </span>
                    <span aria-hidden="true" className="text-cyan-100/32">
                        {'|'}
                    </span>
                    <span className="shrink-0 text-amber-100">
                        {t(`cruise.review.map.phaseShort.${currentPhase}`)}
                    </span>
                    <span aria-hidden="true" className="text-cyan-100/32">
                        {'|'}
                    </span>
                    <span className="min-w-0 truncate font-mono text-cyan-50/62">
                        {formatSimulationDate(
                            tripStart,
                            simulationProgress * totalSeconds,
                        )}
                    </span>
                </div>
                <div className="pointer-events-none absolute inset-x-3 top-3 hidden flex-wrap items-start justify-between gap-3 md:flex">
                    <div className="rounded border border-cyan-100/16 bg-slate-950/72 px-3 py-2 shadow-xl shadow-black/20 backdrop-blur">
                        <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-cyan-200/78 uppercase">
                            {t('cruise.review.map.simulationLabel')}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                            {activePointName || points[0]?.name}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-amber-100">
                            {t(`cruise.review.map.phase.${currentPhase}`)}
                        </p>
                        <p className="mt-1 font-mono text-xs text-cyan-50/70">
                            {formatSimulationDate(
                                tripStart,
                                simulationProgress * totalSeconds,
                            )}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {FLIGHT_PHASE_STYLES.map((phase) => (
                                <span
                                    key={phase.key}
                                    className={`rounded border px-2 py-0.5 text-[0.62rem] font-bold tracking-[0.14em] uppercase transition ${
                                        currentPhase === phase.key
                                            ? phase.activeClass
                                            : 'border-cyan-100/12 bg-slate-950/50 text-cyan-50/45'
                                    }`}
                                >
                                    {t(
                                        `cruise.review.map.phaseShort.${phase.key}`,
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="absolute inset-x-3 bottom-3 hidden rounded border border-cyan-100/14 bg-slate-950/76 p-3 shadow-xl shadow-black/24 backdrop-blur md:block">
                    <div className="grid gap-3 md:grid-cols-[1.618fr_1fr] md:items-stretch">
                        <div className="flex h-full flex-col rounded border border-cyan-100/10 bg-cyan-50/5 p-2.5">
                            <div className="flex min-h-11 items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={togglePlaying}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded bg-cyan-200 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                                >
                                    <i
                                        key={controlIcon}
                                        aria-hidden="true"
                                        className={`fa-solid ${controlIcon}`}
                                    />
                                    {t(controlLabelKey)}
                                </button>
                                <span className="ms-auto text-xs font-semibold text-cyan-50/70">
                                    {formatElapsedTime(
                                        simulationProgress * totalSeconds,
                                    )}
                                </span>
                            </div>
                            <label className="mt-3 block text-[0.65rem] font-bold tracking-[0.16em] text-cyan-100/62 uppercase">
                                <span>
                                    {t('cruise.review.map.controls.timeline')}
                                </span>
                                <input
                                    type="range"
                                    min={0}
                                    max={1000}
                                    value={Math.round(simulationProgress * 1000)}
                                    onChange={(event) => {
                                        updatePlaying(false);
                                        updateProgress(
                                            Number(event.target.value) / 1000,
                                        );
                                    }}
                                    className="mt-2 h-2 w-full cursor-pointer accent-cyan-200"
                                />
                            </label>
                        </div>
                        <div className="flex h-full flex-col rounded border border-amber-200/12 bg-amber-200/8 p-2.5">
                            <div className="flex min-h-11 items-center">
                                <p className="text-[0.65rem] font-bold tracking-[0.16em] text-amber-100/70 uppercase">
                                    {t('cruise.review.map.controls.speed', {
                                        speed: formatSpeed(simulationSpeed),
                                    })}
                                </p>
                            </div>
                            <label className="mt-3 block">
                                <span className="sr-only">
                                    {t('cruise.review.map.controls.speedLabel')}
                                </span>
                                <input
                                    type="range"
                                    min={MIN_SIMULATION_DAYS_PER_SECOND}
                                    max={MAX_SIMULATION_DAYS_PER_SECOND}
                                    step={1 / 24}
                                    value={simulationSpeed / SECONDS_PER_DAY}
                                    onChange={(event) =>
                                        updateSpeed(
                                            Number(event.target.value)
                                                * SECONDS_PER_DAY,
                                        )
                                    }
                                    className="mt-2 h-2 w-full cursor-pointer accent-amber-200"
                                />
                            </label>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                                {SIMULATION_SPEEDS.map((speed) => (
                                    <button
                                        key={speed}
                                        type="button"
                                        onClick={() => updateSpeed(speed)}
                                        className={`cursor-pointer rounded border px-2 py-1 text-[0.65rem] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 ${
                                            isSpeedPresetActive(
                                                simulationSpeed,
                                                speed,
                                            )
                                                ? 'border-amber-200/60 bg-amber-200/18 text-amber-100'
                                                : 'border-cyan-100/14 bg-slate-950/45 text-cyan-50/62 hover:bg-cyan-100/10 hover:text-cyan-50'
                                        }`}
                                    >
                                        {formatSpeed(speed)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute inset-x-3 bottom-3 rounded border border-cyan-100/14 bg-slate-950/82 p-2 shadow-xl shadow-black/24 backdrop-blur md:hidden">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={togglePlaying}
                            className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded bg-cyan-200 text-sm font-bold text-slate-950 transition hover:bg-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                            aria-label={t(controlLabelKey)}
                        >
                            <i
                                key={controlIcon}
                                aria-hidden="true"
                                className={`fa-solid ${controlIcon}`}
                            />
                        </button>
                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-cyan-50/78">
                            {formatElapsedTime(simulationProgress * totalSeconds)}
                        </span>
                        <button
                            type="button"
                            onClick={() =>
                                setShowMobileTimelineControls((current) => !current)
                            }
                            className={`inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded border text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 ${
                                showMobileTimelineControls
                                    ? 'border-cyan-200/60 bg-cyan-200/18 text-cyan-100'
                                    : 'border-cyan-100/18 bg-slate-950/50 text-cyan-50 hover:bg-cyan-100/10'
                            }`}
                            aria-label={t('cruise.review.map.controls.timeline')}
                        >
                            <i aria-hidden="true" className="fa-solid fa-sliders" />
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                setShowMobileSpeedControls((current) => !current)
                            }
                            className={`inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded border text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200 ${
                                showMobileSpeedControls
                                    ? 'border-amber-200/60 bg-amber-200/18 text-amber-100'
                                    : 'border-amber-100/18 bg-slate-950/50 text-amber-50 hover:bg-amber-100/10'
                            }`}
                            aria-label={t('cruise.review.map.controls.speedLabel')}
                        >
                            <i
                                aria-hidden="true"
                                className="fa-solid fa-gauge-high"
                            />
                        </button>
                    </div>
                    {(showMobileTimelineControls || showMobileSpeedControls) && (
                        <div className="mt-2 rounded border border-cyan-100/12 bg-slate-950/72 p-2">
                            {showMobileTimelineControls && (
                                <label className="block text-[0.65rem] font-bold tracking-[0.16em] text-cyan-100/62 uppercase">
                                    <span>
                                        {t('cruise.review.map.controls.timeline')}
                                    </span>
                                    <input
                                        type="range"
                                        min={0}
                                        max={1000}
                                        value={Math.round(
                                            simulationProgress * 1000,
                                        )}
                                        onChange={(event) => {
                                            updatePlaying(false);
                                            updateProgress(
                                                Number(event.target.value) / 1000,
                                            );
                                        }}
                                        className="mt-2 h-2 w-full cursor-pointer accent-cyan-200"
                                    />
                                </label>
                            )}
                            {showMobileSpeedControls && (
                                <div
                                    className={
                                        showMobileTimelineControls ? 'mt-3' : ''
                                    }
                                >
                                    <p className="text-[0.65rem] font-bold tracking-[0.16em] text-amber-100/70 uppercase">
                                        {t('cruise.review.map.controls.speed', {
                                            speed: formatSpeed(simulationSpeed),
                                        })}
                                    </p>
                                    <input
                                        type="range"
                                        min={MIN_SIMULATION_DAYS_PER_SECOND}
                                        max={MAX_SIMULATION_DAYS_PER_SECOND}
                                        step={1 / 24}
                                        value={simulationSpeed / SECONDS_PER_DAY}
                                        onChange={(event) =>
                                            updateSpeed(
                                                Number(event.target.value)
                                                    * SECONDS_PER_DAY,
                                            )
                                        }
                                        className="mt-2 h-2 w-full cursor-pointer accent-amber-200"
                                        aria-label={t(
                                            'cruise.review.map.controls.speedLabel',
                                        )}
                                    />
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {SIMULATION_SPEEDS.map((speed) => (
                                            <button
                                                key={speed}
                                                type="button"
                                                onClick={() => updateSpeed(speed)}
                                                className={`cursor-pointer rounded border px-2 py-1 text-[0.65rem] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 ${
                                                    isSpeedPresetActive(
                                                        simulationSpeed,
                                                        speed,
                                                    )
                                                        ? 'border-amber-200/60 bg-amber-200/18 text-amber-100'
                                                        : 'border-cyan-100/14 bg-slate-950/45 text-cyan-50/62 hover:bg-cyan-100/10 hover:text-cyan-50'
                                                }`}
                                            >
                                                {formatSpeed(speed)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function normalizeRoutePoints(points: RouteMapPoint[]): THREE.Vector3[] {
    return points.map((point) => scaleCoordinates(point));
}

function buildLegSegments(points: THREE.Vector3[]): LegSegment[] {
    const segments: LegSegment[] = [];

    for (let index = 0; index < points.length - 1; index += 2) {
        const start = points[index];
        const end = points[index + 1];

        if (start === undefined || end === undefined) {
            continue;
        }

        segments.push({ end, start });
    }

    return segments;
}

function buildTimeline(legs: Leg[]): TimelineSegment[] {
    const totalSeconds = legs.reduce(
        (total, leg) =>
            total + leg.durationSeconds + leg.layoverDurationSeconds,
        0,
    );

    if (totalSeconds <= 0 || legs.length === 0) {
        return [
            {
                endProgress: 1,
                endSeconds: 1,
                label: 'cruise',
                legIndex: 0,
                routeEnd: 1,
                routeStart: 0,
                startProgress: 0,
                startSeconds: 0,
            },
        ];
    }

    let cursor = 0;
    const segments: TimelineSegment[] = [];

    legs.forEach((leg, legIndex) => {
        const routeRanges = phaseRouteRangesForLeg(leg);
        const phaseDurations: Array<[FlightPhase, number]> = [
            ['acceleration', leg.accelerationDurationSeconds],
            ['cruise', leg.cruiseDurationSeconds + leg.flipDurationSeconds],
            ['deceleration', leg.decelerationDurationSeconds],
            ['layover', leg.layoverDurationSeconds],
        ];

        for (const [label, rawDuration] of phaseDurations) {
            const duration = Math.max(rawDuration, 0);

            if (duration <= 0) {
                continue;
            }

            const startSeconds = cursor;
            const endSeconds = cursor + duration;
            const routeRange = routeRanges[label];

            segments.push({
                endProgress: endSeconds / totalSeconds,
                endSeconds,
                label,
                legIndex,
                routeEnd: routeRange.end,
                routeStart: routeRange.start,
                startProgress: startSeconds / totalSeconds,
                startSeconds,
            });
            cursor = endSeconds;
        }
    });

    return segments;
}

function resolveTimeline(
    timeline: TimelineSegment[],
    progress: number,
): {
    elapsedSeconds: number;
    legIndex: number;
    phase: FlightPhase;
    routeProgress: number;
} {
    const segment =
        timeline.find(
            (entry) =>
                progress >= entry.startProgress && progress <= entry.endProgress,
        ) ?? timeline.at(-1);

    if (segment === undefined) {
        return {
            elapsedSeconds: 0,
            legIndex: 0,
            phase: 'cruise',
            routeProgress: 0,
        };
    }

    const totalSeconds = timeline.at(-1)?.endSeconds ?? 1;
    const elapsedSeconds = progress * totalSeconds;
    const segmentDuration = Math.max(
        segment.endSeconds - segment.startSeconds,
        1,
    );
    const phaseProgress = clamp(
        (elapsedSeconds - segment.startSeconds) / segmentDuration,
        0,
        1,
    );
    const easedPhaseProgress = easePhaseProgress(
        segment.label,
        phaseProgress,
    );
    const routeProgress =
        segment.label === 'layover'
            ? segment.routeEnd
            : segment.routeStart
                + (segment.routeEnd - segment.routeStart) * easedPhaseProgress;

    return {
        elapsedSeconds,
        legIndex: segment.legIndex,
        phase: segment.label,
        routeProgress: clamp(routeProgress, 0, 1),
    };
}

function phaseRouteRangesForLeg(
    leg: Leg,
): Record<FlightPhase, { end: number; start: number }> {
    const distance = Math.max(leg.distanceKm, 1);
    const cruiseDistance = clamp(leg.cruiseDistanceKm, 0, distance);
    const burnDistance = Math.max(distance - cruiseDistance, 0);
    const accelerationEnd = clamp((burnDistance / 2) / distance, 0, 0.5);
    const decelerationStart = clamp(1 - accelerationEnd, 0.5, 1);

    return {
        acceleration: { end: accelerationEnd, start: 0 },
        cruise: { end: decelerationStart, start: accelerationEnd },
        deceleration: { end: 1, start: decelerationStart },
        layover: { end: 1, start: 1 },
    };
}

function phaseRouteLinesForLeg(leg: Leg | undefined): PhaseRouteLine[] {
    if (leg === undefined) {
        return [
            {
                color: FLIGHT_PHASE_STYLES[1].color,
                end: 1,
                start: 0,
            },
        ];
    }

    const ranges = phaseRouteRangesForLeg(leg);

    return FLIGHT_PHASE_STYLES.map((phase) => ({
        color: phase.color,
        end: ranges[phase.key].end,
        start: ranges[phase.key].start,
    })).filter((phase) => phase.end > phase.start);
}

function easePhaseProgress(phase: FlightPhase, progress: number): number {
    if (phase === 'acceleration') {
        return progress * progress;
    }

    if (phase === 'deceleration') {
        return 1 - (1 - progress) * (1 - progress);
    }

    return progress;
}

function formatElapsedTime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);

    if (days > 0) {
        return `${days.toLocaleString()}d ${hours}h`;
    }

    return `${hours}h`;
}

function formatSpeed(speed: number): string {
    const daysPerSecond = speed / SECONDS_PER_DAY;

    if (daysPerSecond >= 1) {
        return `${Math.round(daysPerSecond).toLocaleString()}d/s`;
    }

    const hoursPerSecond = speed / SECONDS_PER_HOUR;

    return `${formatCompactNumber(hoursPerSecond)}h/s`;
}

function formatCompactNumber(value: number): string {
    return value.toLocaleString(undefined, {
        maximumFractionDigits: value < 1 ? 2 : 1,
        minimumFractionDigits: 0,
    });
}

function isSpeedPresetActive(currentSpeed: number, presetSpeed: number): boolean {
    return Math.abs(currentSpeed - presetSpeed) < 1;
}

function formatSimulationDate(tripStart: string, elapsedSeconds: number): string {
    const [year, month, day] = tripStart.split('-').map(Number);

    if (
        !Number.isFinite(year) ||
        !Number.isFinite(month) ||
        !Number.isFinite(day)
    ) {
        return tripStart;
    }

    const timestamp = Date.UTC(year, month - 1, day)
        + Math.round(elapsedSeconds) * 1000;
    const date = new Date(timestamp);
    const displayYear = date.getUTCFullYear();
    const displayMonth = String(date.getUTCMonth() + 1).padStart(2, '0');
    const displayDay = String(date.getUTCDate()).padStart(2, '0');
    const displayHour = String(date.getUTCHours()).padStart(2, '0');
    const displayMinute = String(date.getUTCMinutes()).padStart(2, '0');

    return `${displayYear}-${displayMonth}-${displayDay} ${displayHour}:${displayMinute} UTC`;
}

function scaleAu(au: number): number {
    if (au <= 0) {
        return 0;
    }

    return Math.sqrt(au / MAX_AU) * ORBIT_SCALE;
}

function buildOrbitTracks(
    orbitPaths: MapOrbitPath[],
    planetPositions: RouteMapPoint[],
    routePoints: RouteMapPoint[],
): OrbitTrack[] {
    const tracks = orbitPaths
        .filter((path) => path.points.length > 1 && path.periodDays > 0)
        .map((path): OrbitTrack => {
            const points = path.points.map((point) => ({
                elapsedDays: clamp(point.elapsedDays, 0, path.periodDays),
                position: scaleCoordinates(point),
            }));

            for (const routePoint of routePoints) {
                if (routePoint.code !== path.code) {
                    continue;
                }

                points.push({
                    elapsedDays: normalizedOrbitDay(
                        routePoint.elapsedDays,
                        path.periodDays,
                    ),
                    position: scaleCoordinates(routePoint),
                });
            }

            return {
                code: path.code,
                name: path.name,
                periodDays: path.periodDays,
                points: dedupeOrbitPoints(
                    points.sort(
                        (first, second) => first.elapsedDays - second.elapsedDays,
                    ),
                ),
                style: planetStyleFor(path.code, path.name),
            };
        });

    const knownTrackCodes = new Set(tracks.map((track) => track.code));

    for (const point of planetPositions) {
        if (knownTrackCodes.has(point.code)) {
            continue;
        }

        tracks.push({
            code: point.code,
            name: point.name,
            periodDays: 1,
            points: [
                {
                    elapsedDays: 0,
                    position: scaleCoordinates(point),
                },
            ],
            style: planetStyleFor(point.code, point.name),
        });
    }

    return tracks;
}

function positionForTrack(track: OrbitTrack, elapsedDays: number): THREE.Vector3 {
    if (track.points.length === 0) {
        return new THREE.Vector3(0, 0, 0);
    }

    if (track.points.length === 1) {
        return track.points[0].position.clone();
    }

    const day = normalizedOrbitDay(elapsedDays, track.periodDays);
    const exact = track.points.find(
        (point) => Math.abs(point.elapsedDays - day) <= 0.0001,
    );

    if (exact !== undefined) {
        return exact.position.clone();
    }

    const nextIndex = track.points.findIndex((point) => point.elapsedDays > day);

    if (nextIndex === 0) {
        return track.points[0].position.clone();
    }

    const previous =
        nextIndex === -1 ? track.points.at(-1) : track.points[nextIndex - 1];
    const next = nextIndex === -1 ? track.points[0] : track.points[nextIndex];

    if (previous === undefined || next === undefined) {
        return track.points[0].position.clone();
    }

    const wraps = nextIndex === -1 || next.elapsedDays < previous.elapsedDays;
    const previousDay = previous.elapsedDays;
    const nextDay = wraps
        ? next.elapsedDays + track.periodDays
        : next.elapsedDays;
    const adjustedDay = day < previousDay ? day + track.periodDays : day;
    const span = Math.max(nextDay - previousDay, 0.0001);
    const progress = clamp((adjustedDay - previousDay) / span, 0, 1);

    return previous.position.clone().lerp(next.position, progress);
}

function createOrbitLine(track: OrbitTrack): THREE.Line {
    const points = track.points.map((point) => point.position);

    if (
        points.length > 1
        && !points[0].equals(points[points.length - 1])
    ) {
        points.push(points[0].clone());
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: track.code === 'ear' ? 0x67e8f9 : 0x7dd3fc,
        opacity: track.code === 'ear' ? 0.38 : 0.16,
        transparent: true,
    });

    return new THREE.Line(geometry, material);
}

function dedupeOrbitPoints(points: OrbitTrackPoint[]): OrbitTrackPoint[] {
    return points.reduce<OrbitTrackPoint[]>((deduped, point) => {
        const previous = deduped.at(-1);

        if (
            previous !== undefined
            && Math.abs(previous.elapsedDays - point.elapsedDays) <= 0.0001
        ) {
            deduped[deduped.length - 1] = point;
        } else {
            deduped.push(point);
        }

        return deduped;
    }, []);
}

function normalizedOrbitDay(elapsedDays: number, periodDays: number): number {
    const normalized = elapsedDays % periodDays;

    return normalized < 0 ? normalized + periodDays : normalized;
}

function planetStyleFor(code: string, name: string): PlanetStyle {
    return PLANET_STYLES.find((style) => style.code === code) ?? {
        code,
        name,
        color: 0xe0f2fe,
        size: 0.1,
    };
}

function scaleCoordinates(point: { radiusKm: number; x: number; y: number; z: number }): THREE.Vector3 {
    const magnitudeKm = Math.max(point.radiusKm, 1);
    const scaledRadius = scaleAu(magnitudeKm / AU_KM);
    const scale = scaledRadius / magnitudeKm;

    return new THREE.Vector3(
        point.x * scale,
        point.y * scale,
        point.z * scale,
    );
}

function createRoutePhaseLines(
    segment: LegSegment,
    phaseLines: PhaseRouteLine[],
): THREE.Line[] {
    return phaseLines.map((phaseLine) => {
        const points = [];

        for (let index = 0; index <= 40; index++) {
            const progress =
                phaseLine.start
                + (phaseLine.end - phaseLine.start) * (index / 40);

            points.push(segment.start.clone().lerp(segment.end, progress));
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: phaseLine.color,
            opacity: 0.92,
            transparent: true,
        });

        return new THREE.Line(geometry, material);
    });
}

function createPlanetMarker(style: PlanetStyle): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(style.size, 24, 16);
    const material = new THREE.MeshStandardMaterial({
        color: style.color,
        emissive: style.color,
        emissiveIntensity: 0.16,
        roughness: 0.55,
        metalness: 0.08,
    });

    return new THREE.Mesh(geometry, material);
}

function createRouteMarker(isOrigin: boolean): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(isOrigin ? 0.2 : 0.16, 28, 18);
    const material = new THREE.MeshStandardMaterial({
        color: isOrigin ? 0x67e8f9 : 0xf8fafc,
        emissive: isOrigin ? 0x0891b2 : 0xfbbf24,
        emissiveIntensity: isOrigin ? 0.5 : 0.35,
        roughness: 0.36,
    });

    return new THREE.Mesh(geometry, material);
}

function createShip(): THREE.Group {
    const ship = new THREE.Group();
    const body = new THREE.Mesh(
        new THREE.ConeGeometry(0.18, 0.52, 4),
        new THREE.MeshStandardMaterial({
            color: 0xf8fafc,
            emissive: 0xfbbf24,
            emissiveIntensity: 0.24,
            metalness: 0.2,
            roughness: 0.3,
        }),
    );
    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 16, 10),
        new THREE.MeshBasicMaterial({
            color: 0x67e8f9,
            transparent: true,
            opacity: 0.66,
        }),
    );

    glow.position.y = -0.28;
    ship.add(body, glow);

    return ship;
}

function orientShipToTravelLine(
    ship: THREE.Group,
    tangent: THREE.Vector3,
    isDecelerating: boolean,
) {
    const direction = tangent.clone();

    if (direction.lengthSq() <= 0.000001) {
        return;
    }

    direction.normalize();

    if (isDecelerating) {
        direction.negate();
    }

    ship.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction,
    );
}

function createSun(): THREE.Mesh {
    return new THREE.Mesh(
        new THREE.SphereGeometry(0.36, 32, 18),
        new THREE.MeshBasicMaterial({ color: 0xfbbf24 }),
    );
}

function createStarfield(): THREE.Points {
    const count = 420;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const radius = 8 + Math.random() * 16;
        const angle = Math.random() * Math.PI * 2;
        positions[i * 3] = Math.cos(angle) * radius;
        positions[i * 3 + 1] = Math.sin(angle) * radius;
        positions[i * 3 + 2] = -4 - Math.random() * 8;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    return new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
            color: 0xcffafe,
            opacity: 0.54,
            size: 0.035,
            transparent: true,
        }),
    );
}

function disposeObject(object: THREE.Object3D): void {
    object.traverse((child) => {
        if ('geometry' in child && child.geometry instanceof THREE.BufferGeometry) {
            child.geometry.dispose();
        }

        if ('material' in child) {
            const material = child.material;

            if (Array.isArray(material)) {
                material.forEach((entry) => entry.dispose());
            } else if (material instanceof THREE.Material) {
                material.dispose();
            }
        }
    });
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}
