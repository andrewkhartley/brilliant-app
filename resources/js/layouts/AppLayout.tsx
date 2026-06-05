import { Head } from '@inertiajs/react';

import type { ReactNode } from 'react';

import { Footer } from '@/components/Footer';
import { Nav } from '@/components/Nav';
import { useTranslation } from '@/hooks/useTranslation';

interface AppLayoutProps {
    /** Page body content rendered inside <main>. */
    children: ReactNode;
    /**
     * Optional page-specific title appended to the site name in <title>.
     * Example: pageTitle="Playground" -> "<title>Playground :.: Brilliant</title>"
     */
    pageTitle?: string;
}

/**
 * Top-level app shell wrapping every page rendered through Inertia.
 *
 * Renders:
 * - <Head> with page title (page-specific OR fallback to site name)
 * - Skip-to-main link (sr-only by default; focusable for keyboard users)
 * - <header> with primary <nav>
 * - <main id="main"> as the skip-link target; receives the page's children
 * - <footer> wrapping the <Footer /> component (semantic landmark in this
 *   layout; content composed by Footer — same pattern as <header> + <Nav />)
 *
 * Uses logical Tailwind classes only (ms-/me-/ps-/pe-/start-/end-) so RTL
 * locales flip correctly without per-rule CSS changes.
 *
 * Accessibility baseline:
 * - All landmarks are semantic HTML (header/nav/main/footer), not div+role
 * - Skip-to-main link is the first focusable element; jumps past the nav
 * - <main> has tabIndex={-1} so the skip target can receive programmatic focus
 * - focus-visible base styles (in resources/css/app.css) ensure visible
 *   focus indicators on keyboard tab navigation
 *
 * All user-facing strings flow through useTranslation() — no JSX literals.
 * Even decorative strings (© and attribution name) flow
 * through t() so a future locale can re-style them if needed.
 */
export function AppLayout({ children, pageTitle }: AppLayoutProps) {
    const { t } = useTranslation();
    const siteName = t('common.siteName');
    const fullTitle = pageTitle ? `${pageTitle} :.: ${siteName}` : siteName;

    return (
        <>
            <Head title={fullTitle} />

            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded focus:bg-black focus:px-3 focus:py-2 focus:text-white"
            >
                {t('common.skipToMain')}
            </a>

            <div className="flex min-h-screen flex-col bg-[#08111f]">
                <header>
                    <Nav />
                </header>

                <main
                    id="main"
                    tabIndex={-1}
                    className="relative flex-1 overflow-hidden focus:outline-none"
                >
                    {/* Theme backdrop — always fills <main> regardless of
                        page content height. Per-section gradient/dot overlays
                        layer on top of this for richer texture on long pages;
                        on short pages (Playground hub, etc.) this backdrop is
                        what users see below the section's natural bottom. The
                        gradient/dot opacity is intentionally lighter than the
                        per-section overlays so layering doesn't over-darken
                        on long pages. */}
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(125,211,252,0.12),transparent_45%),linear-gradient(180deg,rgba(8,17,31,0),rgba(8,17,31,0.5))]"
                    />
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.42)_1px,transparent_1px)] [background-size:42px_42px] opacity-25"
                    />
                    <div className="relative">{children}</div>
                </main>

                <footer className="relative bg-[#08111f]">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/34 to-transparent"
                    />
                    <Footer />
                </footer>
            </div>
        </>
    );
}
