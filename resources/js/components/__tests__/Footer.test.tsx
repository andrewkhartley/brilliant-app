/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Footer } from '../Footer';

// Mock @inertiajs/react: usePage() returns the translations bundle shape that
// useTranslation() reads. Mirrors the canonical Laravel namespace structure
// (translations.common.*) so the dot-pathed t() lookups resolve correctly.
vi.mock('@inertiajs/react', () => ({
    usePage: () => ({
        props: {
            locale: 'en',
            dir: 'ltr',
            translations: {
                common: {
                    copyright: '©',
                    separator: ' — ',
                    attribution: 'Andrew Hartley',
                    footer: {
                        sourceAvailable: 'Source available on GitHub.',
                        sourceAttribution:
                            'Cited code retains original attribution.',
                        githubAriaLabel: 'View source on GitHub',
                        emailAriaLabel: 'Email Andrew',
                        githubUrl:
                            'https://github.com/andrewkhartley/brilliant-app',
                        email: 'ahartley@gmail.com',
                        githubLinkText: 'GitHub',
                        emailLinkText: 'Email',
                    },
                },
            },
        },
    }),
}));

describe('Footer', () => {
    // Vitest's `globals: false` config means @testing-library/react's auto
    // cleanup doesn't fire between tests; without this the previous test's
    // DOM persists and queryByText finds duplicate nodes.
    afterEach(() => {
        cleanup();
    });

    test('renders the copyright + attribution row', () => {
        const { container } = render(<Footer />);

        // The row interpolates ©, the current year, separator, and the
        // attribution name into a single <p>. Assert on the attribution text
        // (stable across years) and confirm the © glyph is present somewhere.
        expect(screen.queryByText(/Andrew Hartley/)).not.toBeNull();
        expect(container.textContent).toContain('©');
    });

    test('renders the source-available text and attribution-note text', () => {
        const { container } = render(<Footer />);

        // Both notes render inside the same <p> separated by a space, so
        // queryByText's default exact-element match won't match either half
        // on its own. Regex match against the rendered textContent confirms
        // both substrings are present together.
        expect(container.textContent).toMatch(/Source available on GitHub\./);
        expect(container.textContent).toMatch(
            /Cited code retains original attribution\./,
        );
    });

    test('renders both contact links with correct href and aria-label', () => {
        render(<Footer />);

        const github = screen.queryByRole('link', {
            name: 'View source on GitHub',
        });
        const email = screen.queryByRole('link', { name: 'Email Andrew' });

        expect(github).not.toBeNull();
        expect(github?.getAttribute('href')).toBe(
            'https://github.com/andrewkhartley/brilliant-app',
        );

        expect(email).not.toBeNull();
        expect(email?.getAttribute('href')).toBe('mailto:ahartley@gmail.com');
    });

    test('uses logical Tailwind classes (no physical left/right)', () => {
        const { container } = render(<Footer />);

        // Guard against accidental ms-/me-/ps-/pe-/start-/end- regressions
        // creeping in as physical ml-/mr-/pl-/pr-/left-/right- when refactoring.
        expect(container.innerHTML).not.toMatch(/\b(ml|mr|pl|pr|left|right)-/);
    });
});
