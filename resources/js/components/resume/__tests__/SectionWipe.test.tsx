/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';

import { SectionWipe } from '../SectionWipe';

const valueText = (corporate: number) =>
    `${corporate}% corporate, ${100 - corporate}% honest`;

describe('SectionWipe', () => {
    afterEach(() => {
        cleanup();
    });

    test('starts at 50 with a labelled slider and spoken value text', () => {
        render(
            <SectionWipe handleLabel="Wipe this section" valueText={valueText}>
                <div>{'child'}</div>
            </SectionWipe>,
        );
        const slider = screen.getByRole('slider');

        expect(slider.getAttribute('aria-valuenow')).toBe('50');
        expect(slider.getAttribute('aria-valuetext')).toBe(
            '50% corporate, 50% honest',
        );
        expect(slider.getAttribute('aria-label')).toBe('Wipe this section');
    });

    test('ArrowRight increases the wipe, ArrowLeft decreases it', () => {
        render(
            <SectionWipe handleLabel="Wipe" valueText={valueText}>
                <div>{'child'}</div>
            </SectionWipe>,
        );
        const slider = screen.getByRole('slider');

        fireEvent.keyDown(slider, { key: 'ArrowRight' });
        expect(slider.getAttribute('aria-valuenow')).toBe('52');

        fireEvent.keyDown(slider, { key: 'ArrowLeft' });
        expect(slider.getAttribute('aria-valuenow')).toBe('50');
    });

    test('Home wipes to 0 (all honest), End to 100 (all corporate)', () => {
        // Corporate occupies [0, wipe]; honest occupies [wipe, 100]. So the
        // start edge is all honest and the end edge is all corporate.
        render(
            <SectionWipe handleLabel="Wipe" valueText={valueText}>
                <div>{'child'}</div>
            </SectionWipe>,
        );
        const slider = screen.getByRole('slider');

        fireEvent.keyDown(slider, { key: 'Home' });
        expect(slider.getAttribute('aria-valuenow')).toBe('0');

        fireEvent.keyDown(slider, { key: 'End' });
        expect(slider.getAttribute('aria-valuenow')).toBe('100');
    });

    test('renders its children', () => {
        render(
            <SectionWipe handleLabel="Wipe" valueText={valueText}>
                <div>{'section lines'}</div>
            </SectionWipe>,
        );

        expect(screen.queryByText('section lines')).not.toBeNull();
    });
});
