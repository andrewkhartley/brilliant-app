import { useContext } from 'react';
import type { CSSProperties } from 'react';

import { computeMotion } from './motion';
import { SceneContext } from './Scene';
import type { LayerProps } from './types';

export function Layer(props: LayerProps) {
    const {
        src,
        color,
        label,
        children,
        position,
        depth,
        motion = 'track',
        alt = '',
        opacity,
        size = position === 'full' ? '100%' : '34vh',
        edgeBleed = '0px',
        imageFit = 'cover',
        imagePosition = 'center center',
        variant = 'solid',
        travel = variant === 'cutaway' ? 'viewportAnchored' : 'centered',
        aperture,
    } = props;
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
        travel,
    });
    const isCutaway = variant === 'cutaway';
    const isSizedFullLayer = position === 'full' && size !== '100%';
    const zIndex = Math.round((1 - clamp(depth, 0, 1)) * 100);
    const wrapperStyle: CSSProperties = {
        position: 'absolute',
        insetInline: 0,
        ...(position === 'top' ? { top: `calc(${edgeBleed} * -1)` } : {}),
        ...(position === 'bottom' ? { bottom: `calc(${edgeBleed} * -1)` } : {}),
        ...(position === 'full'
            ? isCutaway || isSizedFullLayer
                ? { top: 0 }
                : { top: 0, bottom: 0 }
            : {}),
        height:
            position === 'full'
                ? isCutaway || isSizedFullLayer
                    ? size
                    : undefined
                : edgeBleed === '0px'
                  ? size
                  : `calc(${size} + ${edgeBleed})`,
        transform: `translate3d(0, ${y}px, 0)`,
        willChange: 'transform',
        zIndex,
        opacity: opacity?.from ?? 1,
        ...(scene.atmosphere && depth > 0.7
            ? { filter: 'blur(0.5px) saturate(0.9)' }
            : {}),
    };

    if (variant === 'cutaway') {
        return (
            <div style={wrapperStyle}>
                <CutawayPlane color={color} label={label} aperture={aperture}>
                    {children}
                </CutawayPlane>
            </div>
        );
    }

    if (src) {
        return (
            <div style={wrapperStyle}>
                <img
                    src={src}
                    alt={alt}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: imageFit,
                        objectPosition: imagePosition,
                        display: 'block',
                    }}
                    loading="lazy"
                    decoding="async"
                />
            </div>
        );
    }

    return (
        <div
            style={{
                ...wrapperStyle,
                background: color,
                boxShadow: 'inset 0 0 0 1px rgb(255 255 255 / 0.18)',
            }}
        >
            <div className="flex h-full items-center justify-center px-6 text-center text-sm font-semibold tracking-widest text-white/90 uppercase">
                <span>{label}</span>
                {children}
            </div>
        </div>
    );
}

interface CutawayPlaneProps {
    children: LayerProps['children'];
    color?: string;
    label?: string;
    aperture?: LayerProps['aperture'];
}

function CutawayPlane({ children, color, label, aperture }: CutawayPlaneProps) {
    const inline = aperture?.inline ?? '54vw';
    const block = aperture?.block ?? '54vh';
    const insetBlockStart = aperture?.insetBlockStart ?? '23vh';
    const wallStyle: CSSProperties = {
        position: 'absolute',
        background: color,
        boxShadow: 'inset 0 0 0 1px rgb(255 255 255 / 0.2)',
    };
    const sideWidth = `calc((100% - ${inline}) / 2)`;
    const bottomStart = `calc(${insetBlockStart} + ${block})`;

    return (
        <div className="absolute inset-0">
            <div
                aria-hidden="true"
                style={{
                    ...wallStyle,
                    insetInline: 0,
                    top: 0,
                    height: insetBlockStart,
                }}
            />
            <div
                aria-hidden="true"
                style={{
                    ...wallStyle,
                    insetInline: 0,
                    top: bottomStart,
                    bottom: 0,
                }}
            />
            <div
                aria-hidden="true"
                style={{
                    ...wallStyle,
                    insetInlineStart: 0,
                    top: insetBlockStart,
                    width: sideWidth,
                    height: block,
                }}
            />
            <div
                aria-hidden="true"
                style={{
                    ...wallStyle,
                    insetInlineEnd: 0,
                    top: insetBlockStart,
                    width: sideWidth,
                    height: block,
                }}
            />
            <div className="absolute inset-x-0 top-6 flex justify-center px-6 text-center text-xs font-semibold tracking-widest text-white/85 uppercase">
                <span>{label}</span>
                {children}
            </div>
        </div>
    );
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
