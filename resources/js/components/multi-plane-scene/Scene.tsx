import { createContext, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import type { SceneContextValue, SceneProps } from './types';

export const SceneContext = createContext<SceneContextValue | null>(null);

/**
 * Native sticky-scroll prototype for the MultiPlaneScene API.
 *
 * This intentionally avoids GSAP and image assets while the visual behavior is
 * being dialed in. A tall section creates scroll distance; a sticky frame stays
 * in view; child layers receive normalized progress through context.
 */
export function Scene(props: SceneProps) {
    const {
        children,
        height,
        aspectLock,
        parallaxStrength = 1,
        atmosphere = false,
        onEnter,
    } = props;

    const sectionRef = useRef<HTMLElement | null>(null);
    const hasEnteredRef = useRef(false);
    const reducedMotion = useReducedMotion();
    const [progress, setProgress] = useState(reducedMotion ? 0.5 : 0);
    const [sectionHeight, setSectionHeight] = useState(0);

    useEffect(() => {
        if (reducedMotion) {
            return;
        }

        let frame = 0;

        const updateProgress = () => {
            const section = sectionRef.current;

            if (!section) {
                return;
            }

            const rect = section.getBoundingClientRect();
            const viewportHeight = window.innerHeight || 1;
            const travelDistance = Math.max(rect.height + viewportHeight, 1);
            const nextProgress = clamp(
                (viewportHeight - rect.top) / travelDistance,
                0,
                1,
            );
            const isNearViewport = rect.top < viewportHeight && rect.bottom > 0;

            setProgress(nextProgress);
            setSectionHeight(rect.height);

            if (isNearViewport && !hasEnteredRef.current) {
                hasEnteredRef.current = true;
                onEnter?.();
            }
        };

        const queueUpdate = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(updateProgress);
        };

        updateProgress();
        window.addEventListener('scroll', queueUpdate, { passive: true });
        window.addEventListener('resize', queueUpdate);

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener('scroll', queueUpdate);
            window.removeEventListener('resize', queueUpdate);
        };
    }, [onEnter, reducedMotion]);

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
        position: 'relative',
        background: '#0f172a',
    };

    const frameStyle: CSSProperties = {
        position: 'sticky',
        top: 0,
        minHeight: '100vh',
        overflow: 'hidden',
        isolation: 'isolate',
        ...(aspectLock ? { aspectRatio: aspectLock.replace(':', '/') } : {}),
    };

    return (
        <SceneContext.Provider value={contextValue}>
            <section ref={sectionRef} style={sectionStyle}>
                <div style={frameStyle}>{children}</div>
            </section>
        </SceneContext.Provider>
    );
}

function useReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const mediaQuery = globalThis.matchMedia?.(
            '(prefers-reduced-motion: reduce)',
        );

        if (!mediaQuery) {
            return;
        }

        const update = () => setReduced(mediaQuery.matches);

        update();
        mediaQuery.addEventListener('change', update);

        return () => mediaQuery.removeEventListener('change', update);
    }, []);

    return reduced;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
