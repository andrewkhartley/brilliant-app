import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

interface UseViewportGateOptions {
    /**
     * IntersectionObserver rootMargin — controls how far outside the viewport
     * the target can be while still counted as "live". Pre-warming distance
     * for the MultiPlaneScene engine (default 50% pre-warms scenes one
     * viewport-height before they enter the actual viewport).
     */
    rootMargin?: string;
    /**
     * IntersectionObserver threshold(s). Default `0` fires immediately
     * when any pixel of the target intersects (or is within rootMargin).
     */
    threshold?: number | number[];
}

/**
 * Reports whether a target element is currently within (or near) the viewport.
 *
 * Used by `useScrollTrigger` to gate the GSAP ScrollTrigger lifecycle:
 * mount → not-yet-live → IO entry → live (ScrollTrigger created) →
 * IO exit → paused (ScrollTrigger killed) → unmount.
 *
 * SSR-safe: returns `false` (paused) on the server. The first browser
 * paint renders with paused=true, then the IO callback (synchronous on
 * mount when the target is already in view) flips to live on the next tick.
 *
 * @param ref - Ref to the element to observe.
 * @param options - rootMargin and threshold for the underlying IntersectionObserver.
 * @returns `live` if the element is intersecting (within rootMargin), else `paused`.
 */
export function useViewportGate(
    ref: RefObject<Element | null>,
    options: UseViewportGateOptions = {},
): boolean {
    const { rootMargin = '50%', threshold = 0 } = options;
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        const target = ref.current;

        if (!target) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                setIsLive(entry?.isIntersecting ?? false);
            },
            { rootMargin, threshold },
        );

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [ref, rootMargin, threshold]);

    return isLive;
}
