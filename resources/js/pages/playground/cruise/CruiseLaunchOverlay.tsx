import { animate } from 'animejs';
import type { JSAnimation } from 'animejs';
import { gsap } from 'gsap';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import { useTranslation } from '@/hooks/useTranslation';

import type { Destination, SelectedSlot } from './DestinationPicker';

interface CruiseLaunchOverlayProps {
    destinations: Destination[];
    selected: SelectedSlot[];
    tripStart: Date | undefined;
    isReady?: boolean;
    revealOnMount?: boolean;
    onRevealComplete?: () => void;
    onViewDetails?: () => void;
}

type OverlayCopyMode = 'preparing' | 'ready';

export function CruiseLaunchOverlay({
    destinations,
    selected,
    tripStart,
    isReady = false,
    revealOnMount = false,
    onRevealComplete,
    onViewDetails,
}: CruiseLaunchOverlayProps) {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rootRef = useRef<HTMLDivElement | null>(null);
    const itineraryLabel = useMemo(
        () =>
            buildItineraryLabel(
                destinations,
                selected,
                t('cruise.launchOverlay.itineraryFallback'),
            ),
        [destinations, selected, t],
    );
    const itineraryStops = useMemo(
        () => buildItineraryStops(destinations, selected),
        [destinations, selected],
    );
    const targetCopyMode: OverlayCopyMode = isReady ? 'ready' : 'preparing';
    const [displayedCopyMode, setDisplayedCopyMode] =
        useState<OverlayCopyMode>(targetCopyMode);
    // Derived rather than stateful: the fade-out class is on whenever the
    // displayed copy differs from the target AND we're not currently
    // tearing down the overlay (revealOnMount). Avoids the
    // react-hooks/set-state-in-effect lint that the old isCopyExiting
    // state triggered for purely-coordination state.
    const isCopyExiting =
        !revealOnMount && targetCopyMode !== displayedCopyMode;
    const showReadyCta =
        isReady && displayedCopyMode === 'ready' && !isCopyExiting;

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, []);

    useEffect(() => {
        // Freeze the copy during the reveal-out fade. Without this guard,
        // clicking the CTA flips `isRevealingItinerary` → `isReady` drops
        // to false → `targetCopyMode` recomputes to 'preparing' and this
        // effect would crossfade the old "preparing" body back in while
        // the overlay itself is fading out. The user sees a brief flash
        // of stale copy before the overlay disappears.
        if (revealOnMount) {
            return;
        }

        if (targetCopyMode === displayedCopyMode) {
            return;
        }

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        // Must match the .cruise-overlay-copy-exit animation duration
        // in resources/css/app.css. Bump both together — drifting them
        // apart causes either a flash of the new copy before the exit
        // completes (JS shorter than CSS) or a blank beat between exit
        // and enter (JS longer than CSS).
        const delay = reducedMotion ? 0 : 750;

        const timeout = window.setTimeout(() => {
            setDisplayedCopyMode(targetCopyMode);
        }, delay);

        return () => window.clearTimeout(timeout);
    }, [displayedCopyMode, revealOnMount, targetCopyMode]);

    useEffect(() => {
        const root = rootRef.current;

        if (!root) {
            return;
        }

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reducedMotion) {
            return;
        }

        const animations: JSAnimation[] = [
            animate(root.querySelectorAll('[data-status-step]'), {
                opacity: [0.45, 1, 0.62],
                translateX: [0, 6, 0],
                duration: 2600,
                delay: (_target: unknown, index: number) => index * 520,
                loop: true,
                ease: 'inOutSine',
            }),
            animate(root.querySelectorAll('[data-scan-line]'), {
                translateX: ['-18%', '118%'],
                opacity: [0, 0.5, 0],
                duration: 3600,
                loop: true,
                ease: 'inOutSine',
            }),
        ];

        return () => {
            for (const animation of animations) {
                animation.revert();
            }
        };
    }, []);

    useEffect(() => {
        const root = rootRef.current;

        if (!root || !showReadyCta) {
            return;
        }

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reducedMotion) {
            return;
        }

        const cta = root.querySelector('[data-ready-cta]');
        const glow = root.querySelector('[data-ready-glow]');

        if (cta === null || glow === null) {
            return;
        }

        const ctaAnimation = animate(cta, {
            translateY: [18, 0],
            scale: [0.96, 1.04, 1],
            opacity: [0, 1],
            duration: 760,
            ease: 'outBack',
        });
        const glowAnimation = animate(glow, {
            scale: [0.86, 1.12, 1],
            opacity: [0, 0.62, 0.36],
            duration: 1200,
            loop: true,
            alternate: true,
            ease: 'inOutSine',
        });

        return () => {
            ctaAnimation.cancel();
            glowAnimation.cancel();
        };
    }, [showReadyCta]);

    useEffect(() => {
        const root = rootRef.current;

        if (!root || !revealOnMount) {
            return;
        }

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        if (reducedMotion) {
            const timeout = window.setTimeout(() => onRevealComplete?.(), 250);

            return () => window.clearTimeout(timeout);
        }

        const timeout = window.setTimeout(() => {
            animate(root.querySelectorAll('[data-hero-copy]'), {
                translateX: [0, -72],
                opacity: [1, 0],
                duration: 760,
                ease: 'inOutSine',
            });
            animate(root.querySelectorAll('[data-console]'), {
                translateY: [0, 140],
                opacity: [1, 0],
                duration: 760,
                ease: 'inOutSine',
            });
            animate(root.querySelectorAll('[data-scene-canvas]'), {
                scale: [1, 1.1],
                opacity: [1, 0],
                duration: 980,
                ease: 'inOutSine',
            });
            animate(root, {
                opacity: [1, 0],
                duration: 980,
                delay: 260,
                ease: 'inOutSine',
            });
        }, 220);
        const completeTimeout = window.setTimeout(
            () => onRevealComplete?.(),
            1500,
        );

        return () => {
            window.clearTimeout(timeout);
            window.clearTimeout(completeTimeout);
        };
    }, [onRevealComplete, revealOnMount]);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const activeCanvas = canvas;
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-5, 5, 3.1, -3.1, 0.1, 100);
        camera.position.z = 10;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            canvas: activeCanvas,
        });
        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const starfield = createStarfield();
        const nearStarfield = createStarfield(84, 0.055, 0.84, 8, 4.6);
        scene.add(starfield);
        scene.add(nearStarfield);

        const routeGroup = new THREE.Group();
        routeGroup.position.set(1.2, 0.62, 0);
        routeGroup.scale.setScalar(0.9);
        scene.add(routeGroup);

        const routeDestinations = buildSceneDestinations(
            destinations,
            selected,
        );
        const routePoints = createRoutePoints(routeDestinations.length);
        const routeLine = createRouteLine(routePoints);
        routeGroup.add(routeLine);

        const textureLoader = new THREE.TextureLoader();
        const destinationMarkers: THREE.Group[] = [];

        routeDestinations.forEach((destination, index) => {
            const marker = createDestinationMarker(
                destination,
                index,
                textureLoader,
            );
            marker.position.copy(routePoints[index]);
            marker.position.z = 0.05;
            routeGroup.add(marker);
            destinationMarkers.push(marker);
        });

        const ship = createShip();
        ship.position.copy(routePoints[0]);
        ship.position.z = 0.35;
        ship.rotation.z = 0.18;
        routeGroup.add(ship);

        function resize() {
            const rect = activeCanvas.getBoundingClientRect();
            renderer.setSize(rect.width, rect.height, false);

            const aspect = rect.width / Math.max(rect.height, 1);
            const verticalHalfSize = 3.2;

            camera.left = -verticalHalfSize * aspect;
            camera.right = verticalHalfSize * aspect;
            camera.top = verticalHalfSize;
            camera.bottom = -verticalHalfSize;
            camera.updateProjectionMatrix();
        }

        resize();

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(activeCanvas);

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        const timeline = reducedMotion
            ? null
            : createFlightTimeline(ship, routePoints);

        if (!reducedMotion) {
            destinationMarkers.forEach((marker, index) => {
                const baseY = marker.position.y;
                const amplitude = 0.045 + (index % 3) * 0.018;

                gsap.to(marker.position, {
                    y: baseY + amplitude,
                    duration: 3.8 + index * 0.42,
                    delay: index * 0.22,
                    repeat: -1,
                    yoyo: true,
                    ease: 'sine.inOut',
                });
            });
            gsap.to(routeLine.material, {
                opacity: 0.32,
                duration: 5.2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
            gsap.to(starfield.rotation, {
                z: -0.04,
                duration: 12,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
            gsap.to(nearStarfield.position, {
                x: -0.18,
                duration: 7,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut',
            });
        }

        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
        });

        return () => {
            timeline?.kill();
            destinationMarkers.forEach((marker) =>
                gsap.killTweensOf(marker.position),
            );
            gsap.killTweensOf(routeLine.material);
            gsap.killTweensOf(starfield.rotation);
            gsap.killTweensOf(nearStarfield.position);
            resizeObserver.disconnect();
            renderer.setAnimationLoop(null);
            renderer.dispose();
            disposeObject(scene);
        };
    }, [destinations, selected]);

    return (
        <div
            ref={rootRef}
            role="status"
            aria-live="polite"
            aria-label={t('cruise.launchOverlay.ariaLabel')}
            className="fixed inset-0 z-[9999] overflow-hidden bg-[#08111f] text-white"
        >
            <canvas
                ref={canvasRef}
                data-scene-canvas
                aria-hidden="true"
                className="absolute inset-0 h-full w-full"
            />

            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_34%,rgba(125,211,252,0.16),transparent_30%),linear-gradient(135deg,rgba(8,17,31,0.2),rgba(15,23,42,0.72))]" />

            <div className="relative z-10 flex min-h-full flex-col justify-between gap-8 px-4 pt-12 pb-5 sm:px-8 sm:pt-16">
                <div data-hero-copy className="max-w-2xl">
                    <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200/30 bg-cyan-50/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                        <CruiseOverlayIcon icon="shuttle" />
                        {t('cruise.launchOverlay.kicker')}
                    </div>
                    <div
                        key={displayedCopyMode}
                        className={
                            isCopyExiting
                                ? 'cruise-overlay-copy-exit'
                                : 'cruise-overlay-copy-enter'
                        }
                    >
                        <h2 className="mt-5 text-4xl font-semibold tracking-normal text-white sm:text-6xl">
                            {copyHeading(displayedCopyMode, t)}
                        </h2>
                        <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
                            {displayedCopyMode === 'ready'
                                ? t('cruise.launchOverlay.ready.body')
                                : t('cruise.launchOverlay.body', {
                                      itinerary: itineraryLabel,
                                      date:
                                          tripStart === undefined
                                              ? t(
                                                    'cruise.launchOverlay.dateFallback',
                                                )
                                              : formatDate(tripStart),
                                  })}
                        </p>
                    </div>
                    {showReadyCta && (
                        <div
                            data-ready-cta
                            className="relative mt-7 inline-flex"
                        >
                            <span
                                data-ready-glow
                                aria-hidden="true"
                                className="absolute inset-0 rounded bg-cyan-200/40 blur-xl"
                            />
                            <button
                                type="button"
                                onClick={onViewDetails}
                                className="relative inline-flex cursor-pointer items-center gap-3 rounded bg-cyan-200 px-6 py-3 text-base font-bold text-slate-950 shadow-[0_0_34px_rgba(103,232,249,0.34)] transition-colors hover:bg-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
                            >
                                <CruiseOverlayIcon icon="route" />
                                {t('cruise.launchOverlay.viewDetails')}
                            </button>
                        </div>
                    )}
                </div>

                <aside
                    data-console
                    className="relative mx-auto w-full max-w-[100rem] overflow-hidden rounded-lg border border-cyan-100/20 bg-slate-950/78 px-5 py-4 text-cyan-50 shadow-2xl shadow-black/35 backdrop-blur-md"
                >
                    <span
                        data-scan-line
                        aria-hidden="true"
                        className="absolute inset-y-0 start-0 w-32 bg-gradient-to-r from-transparent via-cyan-200/20 to-transparent"
                    />
                    <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent" />
                    <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.9fr_1.05fr_minmax(24rem,1.45fr)] lg:items-center">
                        <div>
                            <p className="text-xs font-bold tracking-[0.2em] text-cyan-200/70 uppercase">
                                {t('cruise.launchOverlay.panel.label')}
                            </p>
                            <h3 className="mt-2 text-2xl font-semibold text-white">
                                {t('cruise.launchOverlay.panel.heading')}
                            </h3>
                        </div>

                        <dl className="grid grid-cols-2 gap-4 text-sm lg:grid-cols-1 xl:grid-cols-2">
                            <div className="border-s border-cyan-200/20 ps-4">
                                <dt className="font-medium text-cyan-100/58">
                                    {t('cruise.launchOverlay.panel.departure')}
                                </dt>
                                <dd className="mt-1 font-semibold text-cyan-50">
                                    {tripStart === undefined
                                        ? t('cruise.launchOverlay.dateFallback')
                                        : formatDate(tripStart)}
                                </dd>
                            </div>
                            <div className="border-s border-cyan-200/20 ps-4">
                                <dt className="font-medium text-cyan-100/58">
                                    {t('cruise.launchOverlay.panel.stops')}
                                </dt>
                                <dd className="mt-1 font-semibold text-cyan-50">
                                    {String(Math.max(selected.length, 1))}
                                </dd>
                            </div>
                        </dl>

                        <ol className="space-y-3 border-t border-cyan-100/15 pt-4 sm:border-s sm:border-t-0 sm:ps-5 sm:pt-0">
                            {[
                                t('cruise.launchOverlay.steps.ephemeris'),
                                t('cruise.launchOverlay.steps.transfer'),
                                t('cruise.launchOverlay.steps.itinerary'),
                            ].map((step) => (
                                <li
                                    key={step}
                                    data-status-step
                                    className="flex min-h-6 items-center gap-3 text-sm font-semibold text-cyan-50/78"
                                >
                                    <span className="size-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.7)]" />
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>

                        <div className="min-w-0 border-t border-cyan-100/15 pt-4 lg:border-s lg:border-t-0 lg:ps-5 lg:pt-0">
                            <p className="text-xs font-bold tracking-[0.18em] text-cyan-200/62 uppercase">
                                {t('cruise.launchOverlay.panel.route')}
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2.5">
                                {itineraryStops.map((stop) => (
                                    <span
                                        key={stop}
                                        className="rounded-full border border-cyan-100/15 bg-cyan-50/8 px-3.5 py-1.5 text-sm font-semibold text-cyan-50"
                                    >
                                        {stop}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function createCircle(radius: number, color: number) {
    return new THREE.Mesh(
        new THREE.CircleGeometry(radius, 48),
        new THREE.MeshBasicMaterial({ color }),
    );
}

function copyHeading(
    mode: OverlayCopyMode,
    t: (key: string) => string,
): string {
    if (mode === 'ready') {
        return t('cruise.launchOverlay.ready.heading');
    }

    return t('cruise.launchOverlay.heading');
}

function CruiseOverlayIcon({ icon }: { icon: 'route' | 'shuttle' }) {
    if (icon === 'route') {
        return (
            <span aria-hidden="true" className="relative block size-4">
                <span className="absolute top-0.5 left-0 size-1.5 rounded-full bg-current" />
                <span className="absolute right-0 bottom-0 size-1.5 rounded-full bg-current" />
                <span className="absolute top-[0.42rem] left-[0.35rem] h-0.5 w-3 rotate-45 rounded-full bg-current" />
            </span>
        );
    }

    return (
        <span aria-hidden="true" className="relative block h-4 w-5">
            <span className="absolute top-1/2 left-0 h-2.5 w-4 -translate-y-1/2 rounded-full border-2 border-current bg-current/12" />
            <span className="absolute top-1/2 right-0 h-1.5 w-2 -translate-y-1/2 rounded-r-full bg-current" />
            <span className="absolute top-0 left-1.5 h-1.5 w-1.5 rounded-t-full border-t-2 border-l-2 border-current" />
            <span className="absolute bottom-0 left-1.5 h-1.5 w-1.5 rounded-b-full border-b-2 border-l-2 border-current" />
        </span>
    );
}

function createDestinationMarker(
    destination: Destination,
    index: number,
    textureLoader: THREE.TextureLoader,
) {
    const group = new THREE.Group();
    const texture = textureLoader.load(
        `/assets/img/destinations/${destination.code}.png`,
    );
    texture.colorSpace = THREE.SRGBColorSpace;

    const halo = createCircle(0.39, index === 0 ? 0xbae6fd : 0xe0f2fe);
    halo.material.transparent = true;
    halo.material.opacity = index === 0 ? 0.28 : 0.18;

    const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
        }),
    );
    const scale = index === 0 ? 0.78 : 0.66;
    sprite.scale.set(scale, scale, 1);
    sprite.name = destination.name;

    group.add(halo, sprite);

    return group;
}

function createShip() {
    const group = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.13, 0.5, 4, 16),
        new THREE.MeshBasicMaterial({
            color: 0xf8fafc,
            transparent: true,
        }),
    );
    body.rotation.z = Math.PI / 2;

    const window = createCircle(0.09, 0x38bdf8);
    window.material.transparent = true;
    window.position.set(0.12, 0.03, 0.08);

    const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.1, 0.28, 24),
        new THREE.MeshBasicMaterial({
            color: 0xfde68a,
            transparent: true,
        }),
    );
    flame.position.set(-0.42, 0, -0.01);
    flame.rotation.z = Math.PI / 2;

    group.add(flame, body, window);

    return group;
}

function createRoutePoints(stopCount: number) {
    const count = Math.max(2, Math.min(stopCount, 8));

    return Array.from({ length: count }, (_value, index) => {
        const progress = count === 1 ? 0 : index / (count - 1);
        const x = -3.55 + progress * 7.1;
        const y = Math.sin(progress * Math.PI * 1.15 - 0.45) * 0.85;

        return new THREE.Vector3(x, y, 0);
    });
}

function buildSceneDestinations(
    destinations: Destination[],
    selected: SelectedSlot[],
): Destination[] {
    const earth = destinations.find(
        (destination) => destination.code === 'ear',
    );
    const selectedDestinations = selected
        .map((slot) =>
            destinations.find((destination) => destination.code === slot.code),
        )
        .filter(
            (destination): destination is Destination =>
                destination !== undefined,
        );

    return earth === undefined
        ? selectedDestinations.slice(0, 8)
        : [earth, ...selectedDestinations].slice(0, 8);
}

function createRouteLine(
    points: THREE.Vector3[],
): THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial> {
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.BufferGeometry().setFromPoints(
        curve.getPoints(80),
    );

    return new THREE.Line<THREE.BufferGeometry, THREE.LineBasicMaterial>(
        geometry,
        new THREE.LineBasicMaterial({
            color: 0xbae6fd,
            opacity: 0.24,
            transparent: true,
        }),
    );
}

function createFlightTimeline(ship: THREE.Group, routePoints: THREE.Vector3[]) {
    const shipMaterials = collectMaterials(ship);
    const timeline = gsap.timeline({
        repeat: -1,
        defaults: { ease: 'sine.inOut' },
    });

    routePoints.slice(1).forEach((point, index) => {
        const previous = routePoints[index];
        const angle = Math.atan2(point.y - previous.y, point.x - previous.x);

        timeline.to(ship.position, {
            x: point.x,
            y: point.y,
            duration: 1.35,
        });
        timeline.to(
            ship.rotation,
            {
                z: angle,
                duration: 0.55,
            },
            '<',
        );
    });
    timeline.to(
        shipMaterials,
        {
            opacity: 0,
            duration: 0.5,
        },
        '+=2',
    );
    timeline.set(ship.position, {
        x: routePoints[0].x,
        y: routePoints[0].y,
        z: 0.35,
    });
    timeline.set(ship.rotation, {
        z: 0.18,
    });
    timeline.to(shipMaterials, {
        opacity: 1,
        duration: 0.5,
    });

    return timeline;
}

function collectMaterials(object: THREE.Object3D): THREE.Material[] {
    const materials: THREE.Material[] = [];

    object.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Sprite) {
            if (Array.isArray(child.material)) {
                materials.push(...child.material);
            } else {
                materials.push(child.material);
            }
        }
    });

    return materials;
}

function createStarfield(
    count = 240,
    size = 0.032,
    opacity = 0.56,
    width = 13,
    height = 7,
) {
    const vertices: number[] = [];

    for (let i = 0; i < count; i += 1) {
        vertices.push(
            THREE.MathUtils.randFloatSpread(width),
            THREE.MathUtils.randFloatSpread(height),
            THREE.MathUtils.randFloat(-2, 1),
        );
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(vertices, 3),
    );

    return new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
            color: 0xffffff,
            opacity,
            size,
            transparent: true,
        }),
    );
}

function disposeObject(object: THREE.Object3D) {
    object.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Sprite) {
            child.material.map?.dispose();
            child.material.dispose();
        }

        if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
            child.geometry.dispose();

            if (Array.isArray(child.material)) {
                child.material.forEach((material: THREE.Material) =>
                    material.dispose(),
                );
            } else {
                child.material.dispose();
            }
        }
    });
}

function buildItineraryLabel(
    destinations: Destination[],
    selected: SelectedSlot[],
    fallback: string,
): string {
    const names = selected
        .map((slot) => destinations.find((d) => d.code === slot.code)?.name)
        .filter((name): name is string => name !== undefined);

    return names.length > 0 ? names.join(' -> ') : fallback;
}

function buildItineraryStops(
    destinations: Destination[],
    selected: SelectedSlot[],
): string[] {
    const stops = selected
        .map((slot) => destinations.find((d) => d.code === slot.code)?.name)
        .filter((name): name is string => name !== undefined);

    return stops.length > 0 ? stops : ['TBD'];
}

function formatDate(date: Date): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
    }).format(date);
}
