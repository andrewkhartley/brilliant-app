import { Link } from '@inertiajs/react';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { ResumeLink } from '@/components/ResumeLink';
import { useTranslation } from '@/hooks/useTranslation';

interface NavProps {
    showActionLinks?: boolean;
}

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
export function Nav({ showActionLinks = false }: NavProps) {
    const { t } = useTranslation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMenuClosing, setIsMenuClosing] = useState(false);

    const closeMenu = useCallback(() => {
        setIsMenuClosing(true);
        window.setTimeout(() => {
            setIsMenuOpen(false);
            setIsMenuClosing(false);
        }, 180);
    }, []);

    useEffect(() => {
        if (!isMenuOpen) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [closeMenu, isMenuOpen]);

    const mobileMenu =
        isMenuOpen && typeof document !== 'undefined'
            ? createPortal(
                  <div
                      role="dialog"
                      aria-modal="true"
                      aria-label={t('nav.menuLabel')}
                      className={`fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/78 p-4 backdrop-blur-md md:hidden ${
                          isMenuClosing
                              ? 'nav-mobile-menu-overlay-exit'
                              : 'nav-mobile-menu-overlay-enter'
                      }`}
                      onMouseDown={closeMenu}
                  >
                      <section
                          className={`w-full max-w-sm rounded-lg border border-cyan-100/18 bg-[#08111f] p-5 text-white shadow-2xl shadow-black/50 ${
                              isMenuClosing
                                  ? 'nav-mobile-menu-panel-exit'
                                  : 'nav-mobile-menu-panel-enter'
                          }`}
                          onMouseDown={(event) => event.stopPropagation()}
                      >
                          <div className="flex items-start justify-between gap-4">
                              <div>
                                  <p className="text-xs font-semibold tracking-[0.22em] text-cyan-200/72 uppercase">
                                      {t('nav.menuKicker')}
                                  </p>
                                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                                      {t('common.siteName')}
                                  </h2>
                              </div>
                              <button
                                  type="button"
                                  aria-label={t('nav.closeMenu')}
                                  onClick={closeMenu}
                                  className="grid size-9 cursor-pointer place-items-center rounded-full border border-cyan-100/16 bg-cyan-50/6 text-cyan-100 transition hover:border-cyan-100/34 hover:bg-cyan-50/12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                              >
                                  <i
                                      aria-hidden="true"
                                      className="fa-solid fa-xmark"
                                  />
                              </button>
                          </div>

                          <div className="mt-6 grid gap-3">
                              <Link
                                  href="/playground"
                                  onClick={closeMenu}
                                  className="inline-flex items-center justify-between rounded border border-cyan-100/16 bg-white/5 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                              >
                                  {t('nav.playground')}
                                  <i
                                      aria-hidden="true"
                                      className="fa-solid fa-arrow-right text-xs text-cyan-200"
                                  />
                              </Link>
                              <Link
                                  href="/projects"
                                  onClick={closeMenu}
                                  className="inline-flex items-center justify-between rounded border border-cyan-100/16 bg-white/5 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                              >
                                  {t('nav.projects')}
                                  <i
                                      aria-hidden="true"
                                      className="fa-solid fa-arrow-right text-xs text-cyan-200"
                                  />
                              </Link>
                              {showActionLinks && (
                                  <>
                                      <ResumeLink
                                          href={t('common.footer.cvUrl')}
                                          ariaLabel={t(
                                              'common.footer.cvAriaLabel',
                                          )}
                                          className="inline-flex w-full items-center gap-2 rounded border border-cyan-100/16 bg-white/5 px-4 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                          iconClassName="fa-solid fa-file-lines text-xs text-cyan-200"
                                          label={t('nav.cv')}
                                      />
                                      <a
                                          href={`mailto:${t(
                                              'common.footer.email',
                                          )}`}
                                          onClick={closeMenu}
                                          className="inline-flex items-center justify-between rounded border border-amber-200/35 bg-amber-200/10 px-4 py-3 text-sm font-semibold text-amber-100 transition hover:bg-amber-200/16 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
                                      >
                                          {t('nav.talk')}
                                          <i
                                              aria-hidden="true"
                                              className="fa-solid fa-envelope text-xs text-amber-200"
                                          />
                                      </a>
                                  </>
                              )}
                          </div>
                      </section>
                  </div>,
                  document.body,
              )
            : null;

    return (
        <>
            <nav
                aria-label={t('common.primaryNav')}
                className="border-b border-cyan-100/15 bg-[#08111f]/92 shadow-[0_1px_0_rgba(125,211,252,0.08)] backdrop-blur"
            >
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-5 gap-y-3 px-4 py-3">
                    <Link
                        href="/"
                        className="inline-flex min-w-0 items-center gap-2 text-lg font-bold tracking-tight text-white sm:text-xl"
                    >
                        <i
                            aria-hidden="true"
                            className="fa-solid fa-stars text-sm text-cyan-200"
                        />
                        <span className="truncate">
                            {t('common.siteName')}
                        </span>
                    </Link>

                <button
                    type="button"
                    aria-expanded={isMenuOpen}
                    aria-label={t('nav.openMenu')}
                    onClick={() => {
                        setIsMenuClosing(false);
                        setIsMenuOpen(true);
                    }}
                    className="inline-flex size-10 cursor-pointer items-center justify-center rounded border border-cyan-100/18 bg-white/5 text-cyan-100 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 md:hidden"
                >
                    <i aria-hidden="true" className="fa-solid fa-bars" />
                </button>

                <ul className="hidden flex-1 flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm font-medium md:flex lg:gap-x-6">
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
                    {showActionLinks && (
                        <>
                            <li>
                                <ResumeLink
                                    href={t('common.footer.cvUrl')}
                                    ariaLabel={t(
                                        'common.footer.cvAriaLabel',
                                    )}
                                    className="inline-flex items-center gap-1.5 rounded border border-cyan-100/18 bg-white/5 px-3 py-1.5 text-cyan-100 transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                    iconClassName="fa-solid fa-file-lines text-xs text-cyan-200"
                                    label={t('nav.cv')}
                                />
                            </li>
                            <li>
                                <a
                                    href={`mailto:${t('common.footer.email')}`}
                                    className="inline-flex items-center gap-1.5 rounded border border-amber-200/35 bg-amber-200/10 px-3 py-1.5 text-amber-100 transition hover:bg-amber-200/16 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
                                >
                                    <i
                                        aria-hidden="true"
                                        className="fa-solid fa-envelope text-xs text-amber-200"
                                    />
                                    {t('nav.talk')}
                                </a>
                            </li>
                        </>
                    )}
                </ul>
            </div>
            </nav>
            {mobileMenu}
        </>
    );
}
