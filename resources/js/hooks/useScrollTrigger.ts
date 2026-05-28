import {  useEffect, useRef } from 'react';
import type {RefObject} from 'react';

/**
 * GSAP ScrollTrigger types (loose) — we don't import the actual types from
 * 'gsap/ScrollTrigger' here because doing so would pull GSAP into the
 * bundle even with TypeScript-only imports. Phase 5 stays GSAP-out-of-
 * main-bundle; the type contract is loose-typed at the boundary.
 */
interface ScrollTriggerInstance {
    kill: (revert?: boolean) => void;
    progress: number;
}

interface ScrollTriggerVars {
    trigger: Element;
    start?: string;
    end?: string;
    scrub?: boolean | number;
    pin?: boolean | Element;
    onUpdate?: (self: ScrollTriggerInstance) => void;
    onEnter?: () => void;
    onLeave?: () => void;
}

interface UseScrollTriggerOptions {
    /**
     * Whether ScrollTrigger should be live. Pass `useViewportGate(ref)` here
     * so ScrollTrigger only exists when the scene is in/near the viewport.
     */
    enabled: boolean;
    /**
     * Trigger configuration (matches GSAP ScrollTrigger.create vars).
     * `trigger` is required; other props default per spec.
     */
    vars: Omit<ScrollTriggerVars, 'trigger'> & {
        trigger: RefObject<Element | null>;
    };
}

/**
 * Manages a GSAP ScrollTrigger instance over a React lifecycle, lazily
 * loading GSAP on first activation. Multiple Scene instances on a page
 * share the same dynamically-imported GSAP module after the first load.
 *
 * Lifecycle:
 *   mount + enabled=false → no ScrollTrigger
 *   mount + enabled=true  → dynamic import gsap + ScrollTrigger
 *                           → register plugin → create ScrollTrigger
 *   enabled flips false   → kill ScrollTrigger
 *   enabled flips true    → re-create ScrollTrigger (gsap already loaded)
 *   unmount               → kill ScrollTrigger
 *
 * Lazy import is the load-bearing decision: GSAP (~150KB unminified,
 * ~50KB gzipped including ScrollTrigger) never enters the main bundle.
 * First Scene-in-viewport pays the one-time fetch; subsequent Scenes
 * use the cached module.
 */
export function useScrollTrigger(
    options: UseScrollTriggerOptions,
): RefObject<ScrollTriggerInstance | null> {
    const { enabled, vars } = options;
    const triggerInstanceRef = useRef<ScrollTriggerInstance | null>(null);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const trigger = vars.trigger.current;

        if (!trigger) {
            return;
        }

        let killed = false;

        void (async () => {
            const [{ default: gsap }, { default: ScrollTrigger }] =
                await Promise.all([
                    import('gsap'),
                    import('gsap/ScrollTrigger'),
                ]);

            // The plugin must be registered before ScrollTrigger.create() works.
            // Idempotent — calling registerPlugin multiple times is safe.
            gsap.registerPlugin(ScrollTrigger);

            if (killed) {
                return;
            }

            triggerInstanceRef.current = ScrollTrigger.create({
                trigger,
                start: vars.start ?? 'top top',
                end: vars.end ?? 'bottom bottom',
                scrub: vars.scrub ?? true,
                pin: vars.pin ?? true,
                onUpdate: vars.onUpdate,
                onEnter: vars.onEnter,
                onLeave: vars.onLeave,
            }) as unknown as ScrollTriggerInstance;
        })();

        return () => {
            killed = true;
            triggerInstanceRef.current?.kill();
            triggerInstanceRef.current = null;
        };
    }, [enabled, vars]);

    return triggerInstanceRef;
}
