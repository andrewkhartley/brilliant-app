import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const SECONDS_PER_DAY = 86400;
const SIMULATION_SPEED_SECONDS = SECONDS_PER_DAY * 7;
const MAX_AU = 30.1;
const ORBIT_SCALE = 4.9;

interface MiniPlanet {
    au: number;
    color: number;
    periodDays: number;
    phase: number;
    size: number;
}

const PLANETS: MiniPlanet[] = [
    { au: 0.387, color: 0xb8b1a4, periodDays: 87.97, phase: 0.8, size: 0.035 },
    { au: 0.723, color: 0xe8c27a, periodDays: 224.7, phase: 2.1, size: 0.05 },
    { au: 1, color: 0x67e8f9, periodDays: 365.26, phase: 3.5, size: 0.055 },
    { au: 1.524, color: 0xf97316, periodDays: 686.98, phase: 4.4, size: 0.045 },
    { au: 5.203, color: 0xf6d7a8, periodDays: 4332.59, phase: 5.6, size: 0.12 },
    { au: 9.537, color: 0xfacc15, periodDays: 10759.22, phase: 1.4, size: 0.105 },
    { au: 19.191, color: 0x7dd3fc, periodDays: 30688.5, phase: 2.8, size: 0.085 },
    { au: 30.07, color: 0x60a5fa, periodDays: 60182, phase: 4.9, size: 0.085 },
];

export function SolarSystemMiniMap() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [webglFailed, setWebglFailed] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas === null) {
            return;
        }

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
        camera.position.set(0, -2.2, 15.2);
        camera.lookAt(0, 0, 0);

        let renderer: THREE.WebGLRenderer;

        try {
            renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true,
                canvas,
            });
        } catch {
            window.setTimeout(() => setWebglFailed(true), 0);

            return;
        }

        renderer.setClearColor(0x000000, 0);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        const root = new THREE.Group();
        root.rotation.x = -0.16;
        scene.add(root);

        root.add(createStarfield());
        root.add(createSun());

        const planetMeshes = PLANETS.map((planet) => {
            const orbit = createOrbitLine(orbitRadius(planet.au));
            root.add(orbit);

            const mesh = createPlanet(planet);
            root.add(mesh);

            return { mesh, planet };
        });

        const ambient = new THREE.AmbientLight(0x8ecae6, 1.35);
        const pointLight = new THREE.PointLight(0xfff3bf, 3.4, 50);
        pointLight.position.set(0, 0, 4);
        scene.add(ambient, pointLight);

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            const width = Math.max(rect.width, 1);
            const height = Math.max(rect.height, 1);

            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        resize();

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(canvas);

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        let elapsedDays = 0;
        let lastFrameTime = performance.now();
        let running = true;

        const animate = () => {
            if (!running) {
                return;
            }

            const now = performance.now();
            const elapsedSeconds = Math.min((now - lastFrameTime) / 1000, 0.1);
            lastFrameTime = now;

            if (!reducedMotion) {
                elapsedDays +=
                    (elapsedSeconds * SIMULATION_SPEED_SECONDS) / SECONDS_PER_DAY;
            }

            planetMeshes.forEach(({ mesh, planet }) => {
                const angle =
                    planet.phase +
                    (elapsedDays / planet.periodDays) * Math.PI * 2;
                const radius = orbitRadius(planet.au);

                mesh.position.set(
                    Math.cos(angle) * radius,
                    Math.sin(angle) * radius,
                    0,
                );
            });

            renderer.render(scene, camera);
            window.requestAnimationFrame(animate);
        };

        animate();

        return () => {
            running = false;
            resizeObserver.disconnect();
            disposeObject(scene);
            renderer.dispose();
        };
    }, []);

    if (webglFailed) {
        return <SolarSystemMiniFallback />;
    }

    return (
        <div
            aria-hidden="true"
            className="pointer-events-none relative aspect-video overflow-hidden rounded-lg border border-cyan-100/12 bg-slate-950/34 shadow-2xl shadow-black/24"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.12),transparent_44%),linear-gradient(135deg,rgba(8,17,31,0.36),rgba(15,23,42,0.62))]" />
            <canvas
                ref={canvasRef}
                className="relative block h-full w-full"
            />
        </div>
    );
}

function SolarSystemMiniFallback() {
    return (
        <div
            aria-hidden="true"
            className="pointer-events-none relative aspect-video overflow-hidden rounded-lg border border-cyan-100/12 bg-slate-950/34 shadow-2xl shadow-black/24"
        >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.2),transparent_8%),radial-gradient(circle_at_50%_50%,transparent_13%,rgba(34,211,238,0.18)_13.5%,transparent_14%),radial-gradient(circle_at_50%_50%,transparent_23%,rgba(34,211,238,0.12)_23.5%,transparent_24%),radial-gradient(circle_at_50%_50%,transparent_34%,rgba(34,211,238,0.1)_34.5%,transparent_35%),linear-gradient(135deg,rgba(8,17,31,0.54),rgba(15,23,42,0.78))]" />
        </div>
    );
}

function orbitRadius(au: number): number {
    return Math.sqrt(au / MAX_AU) * ORBIT_SCALE;
}

function createSun(): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(0.18, 32, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    return new THREE.Mesh(geometry, material);
}

function createPlanet(planet: MiniPlanet): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(planet.size, 24, 12);
    const material = new THREE.MeshStandardMaterial({
        color: planet.color,
        emissive: planet.color,
        emissiveIntensity: 0.12,
        metalness: 0.1,
        roughness: 0.64,
    });

    return new THREE.Mesh(geometry, material);
}

function createOrbitLine(radius: number): THREE.LineLoop {
    const segments = 160;
    const points: THREE.Vector3[] = [];

    for (let index = 0; index < segments; index++) {
        const angle = (index / segments) * Math.PI * 2;

        points.push(
            new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0,
            ),
        );
    }

    return new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({
            color: 0x67e8f9,
            opacity: 0.2,
            transparent: true,
        }),
    );
}

function createStarfield(): THREE.Points {
    const geometry = new THREE.BufferGeometry();
    const positions: number[] = [];

    for (let index = 0; index < 90; index++) {
        const angle = index * 2.399963;
        const radius = 5.8 + ((index * 17) % 34) / 10;

        positions.push(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            ((index * 13) % 18) / 10 - 0.9,
        );
    }

    geometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(positions, 3),
    );

    return new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
            color: 0xe0f2fe,
            opacity: 0.42,
            size: 0.018,
            transparent: true,
        }),
    );
}

function disposeObject(object: THREE.Object3D) {
    object.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.LineLoop) {
            child.geometry.dispose();

            if (Array.isArray(child.material)) {
                child.material.forEach((material) => material.dispose());
            } else {
                child.material.dispose();
            }
        }

        if (child instanceof THREE.Points) {
            child.geometry.dispose();

            if (Array.isArray(child.material)) {
                child.material.forEach((material) => material.dispose());
            } else {
                child.material.dispose();
            }
        }
    });
}
