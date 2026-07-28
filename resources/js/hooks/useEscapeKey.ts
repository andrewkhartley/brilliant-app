import { useEffect, useRef } from 'react';

/**
 * Closes a transient overlay when the user presses Escape.
 *
 * Extracted from three byte-identical copies in DestinationPicker,
 * FuelPicker, and MaxSpeedSlider. Each had its own window listener doing
 * exactly this.
 *
 * Deliberately NOT applied to every Escape handler in the codebase — the
 * others differ in ways a shared hook would paper over:
 *  - Nav and ResumeLink omit `preventDefault()`, so folding them in would
 *    change their behavior.
 *  - CovidOrigin and projects handle Escape inside a larger gallery handler
 *    that also owns ArrowLeft/ArrowRight; splitting Escape out would
 *    fragment one coherent keyboard model across two places.
 *  - StoryStage needs `stopImmediatePropagation()` to win against the
 *    listeners beneath it.
 *
 * `onEscape` is held in a ref so an inline arrow from the caller does not
 * resubscribe the listener on every render — the effect depends only on
 * `isActive`, matching the behavior of the code this replaces.
 *
 * @param isActive Whether the overlay is open. No listener is bound when false.
 * @param onEscape Called when Escape is pressed while active.
 */
export function useEscapeKey(isActive: boolean, onEscape: () => void): void {
    const onEscapeRef = useRef(onEscape);

    useEffect(() => {
        onEscapeRef.current = onEscape;
    }, [onEscape]);

    useEffect(() => {
        if (!isActive) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onEscapeRef.current();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isActive]);
}
