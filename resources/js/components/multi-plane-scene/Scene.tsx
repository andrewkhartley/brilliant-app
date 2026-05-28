import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import { useScrollTrigger } from '@/hooks/useScrollTrigger';
import { useViewportGate } from '@/hooks/useViewportGate';

import type { SceneContextValue, SceneProps } from './types';

/**
 * SceneContext exposes the current scroll progress + scene metadata to
 * descendant Layer and Caption components without prop drilling. Lives
 * inside the Scene component file; consumed via useContext in Layer/Caption.
 */
export const SceneContext = createContext<SceneContextValue | null>(null);

/**
 * Top-level wrapper for a multi-plane scene. Owns the IntersectionObserver
 * + GSAP ScrollTrigger lifecycle; passes scroll progress to Layer/Caption
 * children via context.
 *
 * Per the per-instance lifecycle in spec § "Component lifecycle":
 * - mount → IntersectionObserver registers; ScrollTrigger NOT created yet
 * - first IO entry → ScrollTrigger spins up; layers receive scroll progress
 * - IO exit → ScrollTrigger killed (idempotent, cheap); layers freeze at last pose
 * - unmount → all observers + triggers torn down
 *
 * Reduced-motion: when prefers-reduced-motion: reduce, ScrollTrigger is
 * never created. Layers render at progress=0.5 (mid-scroll pose) statically.
 * This is the spec's reduced-motion fallback strategy.
 *
 * No-SSR caveat: scroll progress updates happen via GSAP, which only runs
 * client-side. The first paint renders with progress=0; React hydration
 * + IO entry update it on the next tick.
 */
export function Scene(props: SceneProps) {
    const {
        children,
        height,
        aspectLock,
        rootMargin = '50%',
        parallaxStrength = 1,
        atmosphere = false,
        onEnter,
    } = props;

    const sectionRef = useRef<HTMLElement | null>(null);
    const reducedMotion = useReducedMotion();

    const isInViewport = useViewportGate(sectionRef, { rootMargin });
    const enableScrollTrigger = isInViewport && !reducedMotion;

    const [progress, setProgress] = useState(reducedMotion ? 0.5 : 0);
    const [sectionHeight, setSectionHeight] = useState(0);

    // Observe section's actual rendered height for accurate motion math.
    useEffect(() => {
        const section = sectionRef.current;

        if (!section) {
            return;
        }

        const updateHeight = () =>
            setSectionHeight(section.getBoundingClientRect().height);

        updateHeight();

        const resizeObserver = new ResizeObserver(updateHeight);

        resizeObserver.observe(section);

        return () => resizeObserver.disconnect();
    }, []);

    useScrollTrigger({
        enabled: enableScrollTrigger,
        vars: {
            trigger: sectionRef,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            pin: true,
            onUpdate: (self) => setProgress(self.progress),
            onEnter: onEnter,
        },
    });

    const contextValue = useMemo<SceneContextValue>(
        () => ({
            progress: reducedMotion ? 0.5 : progress,
            sectionHeight,
            parallaxStrength,
            atmosphere,
            reducedMotion,
        }),
        [progress, sectionHeight, parallaxStrength, atmosphere, reducedMotion],
    );

    const sectionStyle: CSSProperties = {
        height,
        contentVisibility: 'auto',
        containIntrinsicSize: height,
        position: 'relative',
        overflow: 'hidden',
        ...(aspectLock ? { aspectRatio: aspectLock.replace(':', '/') } : {}),
    };

    return (
        <SceneContext.Provider value={contextValue}>
            <section ref={sectionRef} style={sectionStyle}>
                {children}
            </section>
        </SceneContext.Provider>
    );
}

/**
 * Hook reading the user's prefers-reduced-motion preference.
 * SSR-safe: returns false on the server; first browser paint reads the
 * media query and updates state on the next tick.
 */
function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const mq = globalThis.matchMedia?.('(prefers-reduced-motion: reduce)');

        if (!mq) {
            return;
        }

        const update = () => setReduced(mq.matches);

        update();
        mq.addEventListener('change', update);

        return () => mq.removeEventListener('change', update);
    }, []);

    return reduced;
}
