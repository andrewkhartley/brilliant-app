import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import * as THREE from 'three';

import { useTranslation } from '@/hooks/useTranslation';

import type { Leg } from './types';

type DataSource = 'horizons' | 'ephemeris';

export interface RouteMapPoint {
    code: string;
    elapsedDays: number;
    name: string;
    x: number;
    y: number;
    radiusKm: number;
}

interface ThreeRouteMapProps {
    dataSource: DataSource;
    fallback: ReactNode;
    legs: Leg[];
    points: RouteMapPoint[];
    tripStart: string;
}

interface PlanetOrbit {
    code: string;
    name: string;
    au: number;
    periodDays: number;
    color: number;
    size: number;
    phase: number;
}

interface PlanetPositionOverride {
    phase: number;
    radius: number;
}

type FlightPhase = 'acceleration' | 'cruise' | 'deceleration' | 'layover';

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

const AU_KM = 149_597_870.7;
const MAX_AU = 30.1;
const ORBIT_SCALE = 15.5;
const PLANETS: PlanetOrbit[] = [
    { code: 'mer', name: 'Mercury', au: 0.387, periodDays: 88, color: 0xb8b1a4, size: 0.09, phase: 1.2 },
    { code: 'ven', name: 'Venus', au: 0.723, periodDays: 224.7, color: 0xe8c27a, size: 0.13, phase: 2.4 },
    { code: 'ear', name: 'Earth', au: 1, periodDays: 365.25, color: 0x67e8f9, size: 0.14, phase: 3.1 },
    { code: 'mar', name: 'Mars', au: 1.524, periodDays: 687, color: 0xf97316, size: 0.12, phase: 4.2 },
    { code: 'jup', name: 'Jupiter', au: 5.203, periodDays: 4332.6, color: 0xf6d7a8, size: 0.24, phase: 0.7 },
    { code: 'sat', name: 'Saturn', au: 9.537, periodDays: 10759, color: 0xfacc15, size: 0.21, phase: 1.7 },
    { code: 'ura', name: 'Uranus', au: 19.191, periodDays: 30685, color: 0x7dd3fc, size: 0.18, phase: 2.9 },
    { code: 'nep', name: 'Neptune', au: 30.069, periodDays: 60189, color: 0x60a5fa, size: 0.18, phase: 4.7 },
];

const SECONDS_PER_DAY = 86400;
const SIMULATION_SPEEDS = [
    SECONDS_PER_DAY,
    SECONDS_PER_DAY * 7,
    SECONDS_PER_DAY * 30,
];

export function ThreeRouteMap({
    dataSource,
    fallback,
    legs,
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

        const planetPositionOverrides = buildPlanetPositionOverrides(points);
        const planetMeshes: THREE.Mesh[] = [];

        for (const planet of PLANETS) {
            const orbit = createOrbitLine(planet, planetPositionOverrides);
            root.add(orbit);

            const marker = createPlanetMarker(planet);
            marker.position.copy(
                positionForPlanet(planet, 0, planetPositionOverrides),
            );
            root.add(marker);
            planetMeshes.push(marker);
        }

        const routeLines = legSegments.map((segment) =>
            createRouteLine(segment.start, segment.end),
        );
        routeLines.forEach((routeLine) => root.add(routeLine));

        const routeMarkers = points.map((point, index) => {
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
            ship.rotation.z = Math.atan2(tangent.y, tangent.x) - Math.PI / 2;
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

            planetMeshes.forEach((mesh, index) => {
                const planet = PLANETS[index];
                mesh.position.copy(
                    positionForPlanet(
                        planet,
                        timelineState.elapsedSeconds / 86400,
                        planetPositionOverrides,
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
    }, [legSegments, points, routePoints, timeline, totalSeconds]);

    if (webglFailed || legSegments.length === 0) {
        return <>{fallback}</>;
    }

    return (
        <div className="relative overflow-hidden rounded border border-cyan-100/14 bg-slate-950/68">
            <canvas
                ref={canvasRef}
                aria-label={t('cruise.review.map.ariaLabel')}
                className="block aspect-[16/10] w-full cursor-grab touch-none active:cursor-grabbing"
            />
            <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-3">
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
                </div>
                <p className="max-w-48 rounded border border-amber-200/18 bg-amber-200/10 px-3 py-2 text-right text-[0.68rem] font-semibold leading-5 text-amber-100/86 backdrop-blur">
                    {t(`cruise.review.map.source.${dataSource}`)}
                </p>
            </div>
            <div className="absolute inset-x-3 bottom-10 rounded border border-cyan-100/14 bg-slate-950/76 p-3 shadow-xl shadow-black/24 backdrop-blur">
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={() => updatePlaying(!isPlaying)}
                        className="inline-flex cursor-pointer items-center gap-2 rounded bg-cyan-200 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                    >
                        <i
                            aria-hidden="true"
                            className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}`}
                        />
                        {t(
                            isPlaying
                                ? 'cruise.review.map.controls.pause'
                                : 'cruise.review.map.controls.play',
                        )}
                    </button>
                    <label className="min-w-0 flex-1 text-xs font-semibold text-cyan-50/78">
                        <span className="sr-only">
                            {t('cruise.review.map.controls.timeline')}
                        </span>
                        <input
                            type="range"
                            min={0}
                            max={1000}
                            value={Math.round(simulationProgress * 1000)}
                            onChange={(event) => {
                                updatePlaying(false);
                                updateProgress(Number(event.target.value) / 1000);
                            }}
                            className="h-2 w-full cursor-pointer accent-cyan-200"
                        />
                    </label>
                    <select
                        value={simulationSpeed}
                        aria-label={t('cruise.review.map.controls.speedLabel')}
                        onChange={(event) => updateSpeed(Number(event.target.value))}
                        className="cursor-pointer rounded border border-cyan-100/20 bg-slate-950 px-2 py-2 text-xs font-bold text-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200"
                    >
                        {SIMULATION_SPEEDS.map((speed) => (
                            <option key={speed} value={speed}>
                                {t('cruise.review.map.controls.speed', {
                                    speed: formatSpeed(speed),
                                })}
                            </option>
                        ))}
                    </select>
                    <span className="text-xs font-semibold text-cyan-50/70">
                        {formatElapsedTime(simulationProgress * totalSeconds)}
                    </span>
                </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-slate-950/86 to-transparent px-4 pb-3 pt-12">
                <p className="text-xs leading-5 text-cyan-50/66">
                    {t('cruise.review.map.interactionHint')}
                </p>
            </div>
        </div>
    );
}

function normalizeRoutePoints(points: RouteMapPoint[]): THREE.Vector3[] {
    return points.map((point) => {
        const radiusAu = point.radiusKm / AU_KM;
        const scaledRadius = scaleAu(radiusAu);
        const angle = Math.atan2(point.y, point.x);

        return new THREE.Vector3(
            Math.cos(angle) * scaledRadius,
            Math.sin(angle) * scaledRadius,
            0,
        );
    });
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
        const travelSeconds = Math.max(leg.durationSeconds, 1);
        let legTravelCursor = 0;
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
            const phaseRouteStart =
                label === 'layover'
                    ? 1
                    : Math.min(legTravelCursor / travelSeconds, 1);

            if (label !== 'layover') {
                legTravelCursor += duration;
            }

            const phaseRouteEnd =
                label === 'layover'
                    ? 1
                    : Math.min(legTravelCursor / travelSeconds, 1);

            segments.push({
                endProgress: endSeconds / totalSeconds,
                endSeconds,
                label,
                legIndex,
                routeEnd: phaseRouteEnd,
                routeStart: phaseRouteStart,
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
    const routeProgress =
        segment.label === 'layover'
            ? segment.routeEnd
            : segment.routeStart
                + (segment.routeEnd - segment.routeStart) * phaseProgress;

    return {
        elapsedSeconds,
        legIndex: segment.legIndex,
        phase: segment.label,
        routeProgress: clamp(routeProgress, 0, 1),
    };
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

    return `${Math.round(speed).toLocaleString()}x`;
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

function buildPlanetPositionOverrides(
    points: RouteMapPoint[],
): Map<string, PlanetPositionOverride> {
    const overrides = new Map<string, PlanetPositionOverride>();

    for (const point of points) {
        const planet = PLANETS.find((entry) => entry.code === point.code);

        if (planet === undefined) {
            continue;
        }

        const observedAngle = Math.atan2(point.y, point.x);
        const elapsedOrbitAngle =
            (point.elapsedDays / planet.periodDays) * Math.PI * 2;
        const observedRadius = scaleAu(point.radiusKm / AU_KM);

        overrides.set(planet.code, {
            phase: observedAngle - elapsedOrbitAngle,
            radius: observedRadius,
        });
    }

    return overrides;
}

function positionForPlanet(
    planet: PlanetOrbit,
    offsetDays: number,
    positionOverrides: Map<string, PlanetPositionOverride>,
): THREE.Vector3 {
    const override = positionOverrides.get(planet.code);
    const radius = override?.radius ?? scaleAu(planet.au);
    const basePhase = override?.phase ?? planet.phase;
    const angle = basePhase + (offsetDays / planet.periodDays) * Math.PI * 2;

    return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
}

function createOrbitLine(
    planet: PlanetOrbit,
    positionOverrides: Map<string, PlanetPositionOverride>,
): THREE.Line {
    const radius = positionOverrides.get(planet.code)?.radius ?? scaleAu(planet.au);
    const points = [];

    for (let i = 0; i <= 192; i++) {
        const angle = (i / 192) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, -0.05));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: planet.code === 'ear' ? 0x67e8f9 : 0x7dd3fc,
        opacity: planet.code === 'ear' ? 0.38 : 0.16,
        transparent: true,
    });

    return new THREE.Line(geometry, material);
}

function createRouteLine(start: THREE.Vector3, end: THREE.Vector3): THREE.Line {
    const points = [];

    for (let index = 0; index <= 80; index++) {
        points.push(start.clone().lerp(end, index / 80));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 0xfbbf24,
        opacity: 0.92,
        transparent: true,
    });

    return new THREE.Line(geometry, material);
}

function createPlanetMarker(planet: PlanetOrbit): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(planet.size, 24, 16);
    const material = new THREE.MeshStandardMaterial({
        color: planet.color,
        emissive: planet.color,
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
