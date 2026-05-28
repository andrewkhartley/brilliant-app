import type { MotionInputs, MotionResult, Position } from './types';

/**
 * Spec math for one layer at one scroll-progress sample.
 */
export function computeMotion(inputs: MotionInputs): MotionResult {
    const {
        position,
        depth,
        sectionHeight,
        progress,
        parallaxStrength,
        motion,
        travel = 'centered',
    } = inputs;

    if (motion === 'static') {
        return { y: 0 };
    }

    const clampedDepth = clamp(depth, 0, 1);
    const clampedProgress = clamp(progress, 0, 1);
    const centeredBaseShift =
        (1 - clampedDepth) * sectionHeight * parallaxStrength;
    const viewportAnchoredBaseShift =
        clampedDepth * sectionHeight * parallaxStrength;
    const y =
        travel === 'viewportAnchored'
            ? computeViewportAnchoredShift(
                  position,
                  viewportAnchoredBaseShift,
                  clampedProgress,
              )
            : computeCenteredShift(
                  position,
                  centeredBaseShift,
                  clampedProgress,
              );

    return { y: y === 0 ? 0 : y };
}

function computeCenteredShift(
    position: Position,
    baseShift: number,
    progress: number,
): number {
    switch (position) {
        case 'full':
            return baseShift * (progress - 0.5);
        case 'top':
            return -baseShift * 0.2 * (1 - progress);
        case 'bottom':
            return baseShift * 0.2 * (1 - progress);
    }
}

function computeViewportAnchoredShift(
    position: Position,
    baseShift: number,
    progress: number,
): number {
    switch (position) {
        case 'full':
            return -baseShift * 0.82 * progress;
        case 'top':
            return -baseShift * 0.82 * progress;
        case 'bottom':
            return -baseShift * 0.82 * progress;
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}
