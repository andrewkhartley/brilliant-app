import { Head } from '@inertiajs/react';

import type { ReactNode } from 'react';

import { useTranslation } from '@/hooks/useTranslation';

interface AppLayoutProps {
    /** Page body content rendered inside <main>. */
    children: ReactNode;
    /**
     * Optional page-specific title appended to the site name in <title>.
     * Example: pageTitle="Playground" → "<title>Playground — Brilliant</title>"
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
 * - <footer> with year + credit + tagline
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
 * Even decorative strings (©, em-dash separator, attribution name) flow
 * through t() so a future locale can re-style them if needed.
 */
export function AppLayout({ children, pageTitle }: AppLayoutProps) {
    const { t } = useTranslation();
    const siteName = t('common.siteName');
    const fullTitle = pageTitle ? `${pageTitle} — ${siteName}` : siteName;
    const currentYear = new Date().getFullYear();

    return (
        <>
            <Head title={fullTitle} />

            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:start-2 focus:top-2 focus:z-50 focus:rounded focus:bg-black focus:px-3 focus:py-2 focus:text-white"
            >
                {t('common.skipToMain')}
            </a>

            <div className="flex min-h-screen flex-col">
                <header className="border-b border-neutral-200">
                    <nav
                        aria-label={t('common.primaryNav')}
                        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3"
                    >
                        <a href="/" className="text-lg font-semibold">
                            {t('common.siteName')}
                        </a>
                        <ul className="flex gap-6">
                            <li>
                                <a href="/playground">{t('nav.playground')}</a>
                            </li>
                            <li>
                                <a href="/about">{t('nav.about')}</a>
                            </li>
                        </ul>
                    </nav>
                </header>

                <main
                    id="main"
                    tabIndex={-1}
                    className="flex-1 focus:outline-none"
                >
                    {children}
                </main>

                <footer className="border-t border-neutral-200">
                    <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-neutral-600">
                        {t('common.copyright')} {currentYear}{' '}
                        <a href="/about" className="underline">
                            {t('common.attribution')}
                        </a>
                        {t('common.separator')}
                        {t('common.siteTagline')}
                    </div>
                </footer>
            </div>
        </>
    );
}
