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
                    copyrightWord: 'Copyright',
                    attribution: 'Andrew K. Hartley',
                    footer: {
                        allRightsReserved: 'All Rights Reserved.',
                        githubAriaLabel: 'View source on GitHub',
                        emailAriaLabel: 'Email Andrew',
                        linkedinAriaLabel: 'View Andrew on LinkedIn',
                        githubUrl:
                            'https://github.com/andrewkhartley/brilliant-app',
                        linkedinUrl:
                            'https://www.linkedin.com/in/andrewkhartley',
                        email: 'ahartley@gmail.com',
                        githubLinkText: 'GitHub',
                        linkedinLinkText: 'LinkedIn',
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

        // The row renders a plain copyright notice. Assert on the attribution
        // text (stable across years) and confirm the © glyph is present.
        expect(screen.queryByText(/Andrew K\. Hartley/)).not.toBeNull();
        expect(container.textContent).toContain('©');
    });

    test('omits the source-available attribution note', () => {
        const { container } = render(<Footer />);

        expect(container.textContent).not.toMatch(/Source available/);
        expect(container.textContent).not.toMatch(/Cited code/);
    });

    test('renders contact links with correct href and aria-label', () => {
        render(<Footer />);

        const github = screen.queryByRole('link', {
            name: 'View source on GitHub',
        });
        const linkedin = screen.queryByRole('link', {
            name: 'View Andrew on LinkedIn',
        });
        const email = screen.queryByRole('link', { name: 'Email Andrew' });

        expect(github).not.toBeNull();
        expect(github?.getAttribute('href')).toBe(
            'https://github.com/andrewkhartley/brilliant-app',
        );

        expect(linkedin).not.toBeNull();
        expect(linkedin?.getAttribute('href')).toBe(
            'https://www.linkedin.com/in/andrewkhartley',
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
