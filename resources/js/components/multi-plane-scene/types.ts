import type { ReactNode } from 'react';

export type Position = 'top' | 'bottom' | 'full';

export type Motion = 'track' | 'drift' | 'static';

export interface MotionResult {
    y: number;
}

export interface MotionInputs {
    position: Position;
    depth: number;
    sectionHeight: number;
    progress: number;
    parallaxStrength: number;
    motion: Motion;
    travel?: 'centered' | 'viewportAnchored';
}

export interface SceneProps {
    children: ReactNode;
    height: string;
    aspectLock?: string;
    rootMargin?: string;
    parallaxStrength?: number;
    atmosphere?: boolean;
    onEnter?: () => void;
}

export interface SceneContextValue {
    progress: number;
    sectionHeight: number;
    parallaxStrength: number;
    atmosphere: boolean;
    reducedMotion: boolean;
}

export interface LayerProps {
    src?: string;
    color?: string;
    label?: string;
    children?: ReactNode;
    position: Position;
    depth: number;
    motion?: Motion;
    offset?: { from?: number; to?: number };
    opacity?: { from?: number; to?: number };
    alt?: string;
    size?: string;
    edgeBleed?: string;
    imageFit?: 'cover' | 'contain';
    imagePosition?: string;
    travel?: 'centered' | 'viewportAnchored';
    variant?: 'solid' | 'cutaway';
    aperture?: {
        inline?: string;
        block?: string;
        insetBlockStart?: string;
    };
}

export interface CaptionProps {
    children: ReactNode;
    at: number;
    fadeWindow?: number;
    align?: 'start' | 'center' | 'end';
}
