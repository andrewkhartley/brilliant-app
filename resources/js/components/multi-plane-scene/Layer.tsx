import { useContext } from 'react';
import type { CSSProperties } from 'react';

import { computeMotion } from './motion';
import { SceneContext } from './Scene';
import type { LayerProps } from './types';

/**
 * A single image layer within a MultiPlaneScene. Reads scroll progress
 * from SceneContext (set by the parent Scene), computes its own
 * y-translation via computeMotion(), and applies it as a CSS transform
 * with GPU compositing hints.
 *
 * Rendering strategy:
 * - GPU compositing: outer div uses transform: translate3d() and
 *   will-change: transform (spec § "Performance discipline").
 * - Image loading: loading="lazy" + decoding="async". Browser defers
 *   work until the layer is near the viewport.
 * - Format fallback: <picture> with AVIF/WebP/PNG sources OR plain <img>
 *   for single-format paths (see Layer's `src` prop documentation).
 * - Atmospheric haze: if Scene's atmosphere flag is true AND this layer's
 *   depth > 0.7, apply filter: blur(0.5px) saturate(0.9) (spec § 5.8).
 *
 * Position-based anchoring is handled via CSS positioning + the
 * y-translation from computeMotion(). 'top'/'bottom' layers absolute-
 * position to the section edge; 'full' layers fill the section.
 */
export function Layer(props: LayerProps) {
    const { src, position, depth, motion = 'track', alt = '', opacity } = props;
    const scene = useContext(SceneContext);

    if (!scene) {
        throw new Error('<Layer> must be rendered inside <MultiPlaneScene>.');
    }

    const { y } = computeMotion({
        position,
        depth,
        sectionHeight: scene.sectionHeight,
        progress: scene.progress,
        parallaxStrength: scene.parallaxStrength,
        motion,
    });

    const wrapperStyle: CSSProperties = {
        position: 'absolute',
        left: 0,
        right: 0,
        ...(position === 'top' ? { top: 0 } : {}),
        ...(position === 'bottom' ? { bottom: 0 } : {}),
        ...(position === 'full' ? { top: 0, bottom: 0 } : {}),
        transform: `translate3d(0, ${y}px, 0)`,
        willChange: 'transform',
        ...(opacity?.from !== undefined ? { opacity: opacity.from } : {}),
        ...(scene.atmosphere && depth > 0.7
            ? { filter: 'blur(0.5px) saturate(0.9)' }
            : {}),
    };

    const imageStyle: CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    };

    return <div style={wrapperStyle}>{renderImage(src, alt, imageStyle)}</div>;
}

/**
 * Renders either a plain <img> (if src has an extension) or a <picture>
 * with AVIF/WebP/PNG sources (if src has no extension).
 */
function renderImage(src: string, alt: string, style: CSSProperties) {
    const hasExtension = /\.[a-z0-9]{2,5}$/i.test(src);

    if (hasExtension) {
        return (
            <img
                src={src}
                alt={alt}
                style={style}
                loading="lazy"
                decoding="async"
            />
        );
    }

    return (
        <picture>
            <source type="image/avif" srcSet={`${src}.avif`} />
            <source type="image/webp" srcSet={`${src}.webp`} />
            <img
                src={`${src}.png`}
                alt={alt}
                style={style}
                loading="lazy"
                decoding="async"
            />
        </picture>
    );
}
