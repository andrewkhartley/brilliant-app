import { useContext } from 'react';

import { SceneContext } from './Scene';
import type { CaptionProps } from './types';

/**
 * Prose caption rendered at a specific scroll-progress point. Fades in as
 * the scene's progress approaches `at`, holds fully visible at progress=at,
 * fades out as progress moves past. Fade window is configurable; default
 * 0.15 means the caption is visible across roughly 15% of scroll progress.
 *
 * Direction-aware: text alignment defaults to 'start' (translates to text-left
 * in LTR locales, text-right in RTL). Override via the align prop.
 *
 * Reduced-motion: when SceneContext.reducedMotion is true, all captions
 * are rendered at full opacity (no fade) — prose stays readable.
 */
export function Caption(props: CaptionProps) {
    const { children, at, fadeWindow = 0.15, align = 'start' } = props;
    const scene = useContext(SceneContext);

    if (!scene) {
        throw new Error('<Caption> must be rendered inside <MultiPlaneScene>.');
    }

    const opacity = scene.reducedMotion
        ? 1
        : computeFadeOpacity(scene.progress, at, fadeWindow);
    const textAlignClass =
        align === 'start'
            ? 'text-start'
            : align === 'center'
              ? 'text-center'
              : 'text-end';

    return (
        <div
            className={`absolute inset-x-0 bottom-12 z-10 mx-auto max-w-2xl px-6 ${textAlignClass}`}
            style={{
                opacity,
                transition: scene.reducedMotion
                    ? undefined
                    : 'opacity 0.3s ease-out',
            }}
        >
            <div className="rounded-md bg-black/60 px-6 py-4 text-white">
                {children}
            </div>
        </div>
    );
}

/**
 * Triangular fade: opacity 0 → 1 as progress moves from (at - fadeWindow) to at,
 * 1 → 0 as progress moves from at to (at + fadeWindow). Outside the window, 0.
 */
function computeFadeOpacity(
    progress: number,
    at: number,
    fadeWindow: number,
): number {
    const distance = Math.abs(progress - at);

    if (distance >= fadeWindow) {
        return 0;
    }

    return 1 - distance / fadeWindow;
}
