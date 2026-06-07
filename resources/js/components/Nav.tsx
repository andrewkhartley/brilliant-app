import { Link } from '@inertiajs/react';

import { useTranslation } from '@/hooks/useTranslation';

/**
 * Primary site navigation — sticky header chrome composed by AppLayout.
 *
 * Renders:
 * - <nav aria-label> semantic landmark with translated accessible name
 * - Brand mark (text-only for v1) linking to "/"
 * - Primary links: Playground (/playground), Projects (/projects)
 *
 * Layout:
 * - Sticky at viewport top (sticky top-0 z-50) with translucent backdrop so
 *   page content scrolling beneath remains partially visible
 * - flex justify-between: brand on the start side, links on the end side
 * - At <md width, flex-wrap drops the link list onto its own row below the
 *   brand mark — v1's 2-link nav doesn't justify a hamburger toggle
 *
 * Accessibility:
 * - <nav> + aria-label gives AT a distinct landmark name (one nav per page,
 *   but AT users navigate by landmark; the label aids quick orientation)
 * - The skip-link in AppLayout sits BEFORE this component in the DOM so the
 *   first focusable element is still "Skip to main content"
 *
 * i18n:
 * - All user-facing strings flow through t() — brand mark, link labels, the
 *   aria-label itself. Keys live in the universal bundles: link labels in
 *   lang/en/nav.php (nav.playground, nav.projects); brand mark and aria-label in
 *   lang/en/common.php (common.siteName, common.primaryNav). Both namespaces
 *   are auto-bundled by the translations() helper.
 *
 * Logical Tailwind classes only (no ml-/mr-/pl-/pr-/left-/right-). gap-* and
 * justify-between handle horizontal spacing locale-independently; mx-auto and
 * px-* are bidirectional by definition.
 *
 * Link destinations: /playground and /projects are first-class app routes.
 */
export function Nav() {
    const { t } = useTranslation();

    return (
        <nav
            aria-label={t('common.primaryNav')}
            className="sticky top-0 z-50 border-b border-cyan-100/15 bg-[#08111f]/92 shadow-[0_1px_0_rgba(125,211,252,0.08)] backdrop-blur"
        >
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xl font-bold tracking-tight text-white"
                >
                    <i
                        aria-hidden="true"
                        className="fa-solid fa-stars text-sm text-cyan-200"
                    />
                    {t('common.siteName')}
                </Link>
                <ul className="flex flex-wrap items-center gap-6">
                    <li>
                        <Link
                            href="/playground"
                            className="text-sm font-medium text-cyan-100/78 transition-colors hover:text-white"
                        >
                            {t('nav.playground')}
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/projects"
                            className="text-sm font-medium text-cyan-100/78 transition-colors hover:text-white"
                        >
                            {t('nav.projects')}
                        </Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}
