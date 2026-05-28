/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';

import { LiveResult } from '../LiveResult';

// LiveResult requires no @inertiajs/react mock — it has no useTranslation
// dependency. The label string comes from props, keeping the primitive
// layout-agnostic and trivially testable. The four tests below verify the
// a11y contract (role + aria-live + aria-atomic), value rendering, and the
// optional-label slot — the full surface of the component.

describe('LiveResult', () => {
    afterEach(() => {
        cleanup();
    });

    test('renders with role="status" and aria-live="polite"', () => {
        // role="status" + aria-live="polite" is the core a11y contract:
        // AT announces changes without interrupting whatever the user is
        // hearing. Drop either attribute and the announcement contract
        // silently breaks for screen-reader users.
        render(<LiveResult>{'42'}</LiveResult>);
        const region = screen.queryByRole('status');

        expect(region).not.toBeNull();
        expect(region?.getAttribute('aria-live')).toBe('polite');
    });

    test('renders with aria-atomic="true"', () => {
        // aria-atomic="true" forces the WHOLE region to be re-announced on
        // every change, not just the diff. Short result strings like
        // "Area: 314.16 m²" need the full string each time for context.
        render(<LiveResult>{'42'}</LiveResult>);
        const region = screen.queryByRole('status');

        expect(region?.getAttribute('aria-atomic')).toBe('true');
    });

    test('displays the children value', () => {
        // The value passed in via children is what AT reads and what
        // sighted users see — proves the slot actually renders.
        render(<LiveResult>{'0.5c'}</LiveResult>);

        expect(screen.queryByText('0.5c')).not.toBeNull();
    });

    test('renders optional label preceding the value', () => {
        // The label slot is optional but commonly used to prepend a
        // semantic prefix ("Velocity:" / "Area:") so the announcement
        // reads as a full sentence rather than a bare number.
        render(<LiveResult label="Velocity:">{'0.5c'}</LiveResult>);

        expect(screen.queryByText('Velocity:')).not.toBeNull();
        expect(screen.queryByText('0.5c')).not.toBeNull();
    });
});
