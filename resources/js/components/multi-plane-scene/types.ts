/**
 * Shared types for the MultiPlaneScene component family.
 *
 * Public types are re-exported from index.ts (the public API barrel).
 * Internal-only types stay un-exported from index.ts.
 */

import type { ReactNode } from 'react';

/**
 * Layer anchoring within the scene's shadowbox frame.
 * - 'top': anchors to the top edge (e.g., ceiling beams, sky)
 * - 'bottom': anchors to the bottom edge (e.g., floor, foreground rail)
 * - 'full': fills the scene; tracks through center under scroll
 */
export type Position = 'top' | 'bottom' | 'full';

/**
 * Layer motion behavior.
 * - 'track': scroll-tied (default) — y position is a function of scroll progress
 * - 'drift': subtle ambient motion even when scroll is paused (Phase 5 spec'd,
 *            v1 implementation: behaves as 'static' for now — drift requires
 *            independent animation that's out of scope for the initial engine.
 *            Documented for future enhancement.)
 * - 'static': no movement
 */
export type Motion = 'track' | 'drift' | 'static';

/**
 * Computed motion result for one layer at one scroll progress sample.
 */
export interface MotionResult {
    /** Vertical translation in pixels. */
    y: number;
}

/**
 * Inputs to computeMotion().
 */
export interface MotionInputs {
    /** Layer anchoring (top / bottom / full). */
    position: Position;
    /** Layer depth 0..1 (0 = near, 1 = far). */
    depth: number;
    /** Section height in pixels. */
    sectionHeight: number;
    /** Scroll progress 0..1 (0 = section top meets viewport top; 1 = section bottom meets viewport bottom). */
    progress: number;
    /** Global multiplier 0..1.5 (1 = spec default). */
    parallaxStrength: number;
    /** Motion mode. 'static' returns y=0 regardless of inputs. */
    motion: Motion;
}

export interface SceneProps {
    children: ReactNode;
    /** Section height, e.g. '200vh' (longer = more scroll "track" room). */
    height: string;
    /** Optional aspect-ratio lock for the visible frame (e.g. '16:9', '4:3'). */
    aspectLock?: string;
    /** Pre-warm distance for IntersectionObserver (default '50%'). */
    rootMargin?: string;
    /** Global parallax multiplier 0..1.5 (default 1). */
    parallaxStrength?: number;
    /** When true, layers with depth > 0.7 receive auto blur+saturate (atmospheric haze). */
    atmosphere?: boolean;
    /** Optional analytics/audio-cue hook fired when the scene first enters viewport. */
    onEnter?: () => void;
}

/**
 * Internal context: Layer + Caption components read these values from the
 * surrounding Scene to compute their own positioning + visibility.
 */
export interface SceneContextValue {
    /** Current scroll progress 0..1 (0 when reduced-motion forces static pose). */
    progress: number;
    /** Section height in pixels (for motion math). */
    sectionHeight: number;
    /** Global parallax multiplier from Scene props. */
    parallaxStrength: number;
    /** Atmospheric haze flag from Scene props. */
    atmosphere: boolean;
    /** Whether the user prefers reduced motion (renders static mid-scroll pose). */
    reducedMotion: boolean;
}
