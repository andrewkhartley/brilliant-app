import type { MotionInputs, MotionResult, Position } from './types';

/**
 * Computes the vertical translation for one Layer at one scroll progress sample.
 *
 * Per spec § "Depth → motion formula":
 *
 *   For section height h, scroll progress p ∈ [0,1], parallaxStrength s:
 *     baseShift = (1 - depth) * h * s
 *
 *     position="full"    → y = baseShift * (p - 0.5)         // tracks through center
 *     position="top"     → y = -baseShift * 0.2 * (1 - p)    // anchored, micro-shift
 *     position="bottom"  → y =  baseShift * 0.2 * (1 - p)    // anchored, micro-shift
 *
 * motion="static" short-circuits to y=0 regardless of inputs.
 * motion="drift" is reserved for future enhancement; v1 behaves as 'track'.
 *
 * The depth-of-field relationship: a depth=0.05 layer moves ~95% of the
 * track distance; a depth=0.92 layer moves ~8%. Decimal depths encouraged.
 */
export function computeMotion(inputs: MotionInputs): MotionResult {
    const {
        position,
        depth,
        sectionHeight,
        progress,
        parallaxStrength,
        motion,
    } = inputs;

    if (motion === 'static') {
        return { y: 0 };
    }

    const clampedDepth = clamp(depth, 0, 1);
    const baseShift = (1 - clampedDepth) * sectionHeight * parallaxStrength;

    // Normalize IEEE-754 signed zero (-0 → +0) so downstream consumers and
    // Object.is-based equality checks see a single canonical zero. The
    // explicit ternary (vs the equivalent `+ 0` no-op) makes the intent
    // readable to humans and static analyzers alike.
    const y = computePositionShift(position, baseShift, progress);

    return { y: y === 0 ? 0 : y };
}

function computePositionShift(
    position: Position,
    baseShift: number,
    progress: number,
): number {
    switch (position) {
        case 'full':
            // Tracks through center: y=0 at p=0.5; ±baseShift/2 at p=0/1
            return baseShift * (progress - 0.5);
        case 'top':
            // Anchored to top edge; micro-shift inward as the user scrolls in
            return -baseShift * 0.2 * (1 - progress);
        case 'bottom':
            // Mirror of 'top' — anchored to bottom edge
            return baseShift * 0.2 * (1 - progress);
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
