/** @vitest-environment jsdom */
import { cleanup, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { AppLayout } from '../AppLayout';

// Mock @inertiajs/react: usePage() returns the translations bundle shape that
// useTranslation() reads (union of the keys Nav, Footer, and the layout's own
// skip-link consume); Head and Link are thin shims so the real layout
// composition renders without Inertia's router.
vi.mock('@inertiajs/react', () => ({
    usePage: () => ({
        props: {
            locale: 'en',
            dir: 'ltr',
            translations: {
                common: {
                    siteName: "Andrew's Application",
                    primaryNav: 'Primary navigation',
                    skipToMain: 'Skip to main content',
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
                nav: {
                    playground: 'Playground',
                    projects: 'Projects',
                    openMenu: 'Open menu',
                },
            },
        },
    }),
    Head: () => null,
    Link: ({ children, href }: { children: ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

describe('AppLayout', () => {
    // Vitest's `globals: false` config means @testing-library/react's auto
    // cleanup doesn't fire between tests; without this the previous test's
    // DOM persists and queries find duplicate nodes.
    afterEach(() => {
        cleanup();
    });

    test('keeps the nav chrome sticky at the viewport top', () => {
        const { container } = render(
            <AppLayout>
                <p>{'page content'}</p>
            </AppLayout>,
        );

        // Stickiness is the layout's responsibility (the <header> wrapper),
        // not Nav's — Nav renders position-neutral chrome. jsdom can't
        // exercise real scroll behavior, so this pins the class contract;
        // sticky also requires no overflow-clipping ANCESTOR of <header>,
        // which holds here because overflow-hidden lives on its <main>
        // sibling.
        const header = container.querySelector('header');

        expect(header).not.toBeNull();
        expect(header!.className).toContain('sticky');
        expect(header!.className).toContain('top-0');
        expect(header!.querySelector('nav')).not.toBeNull();
    });
});
