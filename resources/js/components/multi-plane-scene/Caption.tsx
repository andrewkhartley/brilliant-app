import { useContext } from 'react';

import { SceneContext } from './Scene';
import type { CaptionProps } from './types';

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
            className={`absolute inset-x-0 bottom-10 z-[120] mx-auto max-w-2xl px-6 ${textAlignClass}`}
            style={{
                opacity,
                transition: scene.reducedMotion
                    ? undefined
                    : 'opacity 0.3s ease-out',
            }}
        >
            <div className="rounded-md bg-black/70 px-6 py-4 text-white shadow-2xl backdrop-blur">
                {children}
            </div>
        </div>
    );
}

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
