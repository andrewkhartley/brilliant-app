import { useCallback, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';

interface SectionWipeProps {
    children: ReactNode;
    handleLabel: string;
    /** Builds the slider's spoken value text from the current corporate %. */
    valueText: (corporatePercent: number) => string;
}

const STEP = 2;

const clamp = (value: number) => Math.max(0, Math.min(100, value));

/**
 * Wraps a single résumé section's lines and owns THAT section's `--wipe` value
 * (0–100, independent per section). It sets `--wipe` as a CSS custom property
 * on its wrapper, so the section's ResumeLines clip against this section's own
 * seam — one drag wipes only this section, and each section transforms
 * independently of the others.
 *
 * The handle is a real ARIA slider: focusable, arrow/Home/End driven, labelled,
 * and announces its position via aria-valuetext ("30% corporate, 70% honest").
 * It sits at the vertical center of the section so it's reachable as you read
 * that section, without a page-level control. Pointer drag moves the seam and
 * does not interfere with vertical scroll (touch-action: none on the handle).
 *
 * Corporate occupies [0, wipe] on the inline-start side; honest occupies
 * [wipe, 100] on the inline-end side. So Home (wipe 0) reveals all honest and
 * End (wipe 100) reveals all corporate.
 */
export function SectionWipe({ children, handleLabel, valueText }: SectionWipeProps) {
    const [wipe, setWipe] = useState(50);
    const trackRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);

    const setFromClientX = useCallback((clientX: number) => {
        const track = trackRef.current;

        if (!track) {
            return;
        }

        const rect = track.getBoundingClientRect();

        setWipe(clamp(((clientX - rect.left) / rect.width) * 100));
    }, []);

    const handlePointerDown = (event: React.PointerEvent) => {
        draggingRef.current = true;
        event.currentTarget.setPointerCapture(event.pointerId);
        setFromClientX(event.clientX);
    };

    const handlePointerMove = (event: React.PointerEvent) => {
        if (!draggingRef.current) {
            return;
        }

        setFromClientX(event.clientX);
    };

    const handlePointerUp = (event: React.PointerEvent) => {
        draggingRef.current = false;
        event.currentTarget.releasePointerCapture(event.pointerId);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault();
            setWipe((value) => clamp(value + STEP));
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault();
            setWipe((value) => clamp(value - STEP));
        }

        if (event.key === 'Home') {
            event.preventDefault();
            setWipe(0);
        }

        if (event.key === 'End') {
            event.preventDefault();
            setWipe(100);
        }
    };

    const rounded = Math.round(wipe);
    const wrapperStyle = { '--wipe': `${wipe}%` } as CSSProperties;

    return (
        <div ref={trackRef} style={wrapperStyle} className="relative">
            {children}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-cyan-300/55 to-transparent"
                style={{
                    insetInlineStart: 'var(--wipe)',
                    transform: 'translateX(-0.5px)',
                }}
            />

            <div
                role="slider"
                tabIndex={0}
                aria-label={handleLabel}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={rounded}
                aria-valuetext={valueText(rounded)}
                onKeyDown={handleKeyDown}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="absolute top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize touch-none place-items-center rounded-full bg-cyan-300 text-slate-950 shadow-lg shadow-black/40 ring-4 ring-cyan-300/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                style={{ insetInlineStart: 'var(--wipe)' }}
            >
                <i aria-hidden="true" className="fa-solid fa-left-right text-sm" />
            </div>
        </div>
    );
}
