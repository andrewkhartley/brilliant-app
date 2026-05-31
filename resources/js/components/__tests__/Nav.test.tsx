/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { Nav } from '../Nav';

// Mock @inertiajs/react: usePage() returns the translations bundle shape that
// useTranslation() reads; Link is a thin <a> shim so we exercise the real
// href + className wiring without pulling in Inertia's router.
vi.mock('@inertiajs/react', () => ({
    usePage: () => ({
        props: {
            locale: 'en',
            dir: 'ltr',
            translations: {
                common: {
                    siteName: "Andrew's Brilliant Application",
                    primaryNav: 'Primary navigation',
                },
                nav: {
                    playground: 'Playground',
                    about: 'About',
                },
            },
        },
    }),
    Link: ({ children, href }: { children: ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

describe('Nav', () => {
    // Vitest's `globals: false` config means @testing-library/react's auto
    // cleanup doesn't fire between tests; without this the previous test's
    // DOM persists and queryByText finds duplicate brand-mark nodes.
    afterEach(() => {
        cleanup();
    });

    test('renders the brand mark', () => {
        render(<Nav />);

        expect(
            screen.queryByText("Andrew's Brilliant Application"),
        ).not.toBeNull();
    });

    test('renders primary navigation landmark with translated aria-label', () => {
        render(<Nav />);

        const nav = screen.queryByRole('navigation', {
            name: 'Primary navigation',
        });

        expect(nav).not.toBeNull();
        expect(nav?.tagName).toBe('NAV');
    });

    test('renders Playground and About primary links', () => {
        render(<Nav />);

        expect(screen.queryByText('Playground')).not.toBeNull();
        expect(screen.queryByText('About')).not.toBeNull();
    });

    test('uses logical Tailwind classes (no physical left/right)', () => {
        const { container } = render(<Nav />);

        // Guard against accidental ms-/me-/ps-/pe- regressions creeping in as
        // physical ml-/mr-/pl-/pr-/left-/right- when refactoring.
        expect(container.innerHTML).not.toMatch(/\b(ml|mr|pl|pr|left|right)-/);
    });

    test('is sticky-positioned', () => {
        const { container } = render(<Nav />);

        expect(container.querySelector('.sticky')).not.toBeNull();
    });
});
