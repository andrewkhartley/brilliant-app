import { useTranslation } from '@/hooks/useTranslation';

/**
 * Site footer — bottom chrome composed by AppLayout.
 *
 * Renders two compact rows:
 * - Row 1: copyright notice plus GitHub and Email links
 * - Row 2: source-availability note + cited-code attribution note (the
 *   transparency promise — Andrew's commit history is part of the work
 *   product, so the footer acknowledges that publicly on every page)
 * - Row 1 also includes GitHub + Email links with aria-label names
 *
 * Composition:
 * - AppLayout owns the <footer> semantic landmark wrapper; this component
 *   renders the inner content. Mirrors how Nav sits inside AppLayout's
 *   <header> — the layout owns landmarks, the component owns content.
 *
 * i18n:
 * - All user-facing strings flow through t() — including © glyph,
 *   attribution name, link labels, and aria-labels. The mailto: scheme is
 *   composed inline (it's protocol, not content) but the email address
 *   itself is a translation key so a future locale could provide a different
 *   contact email if needed.
 * - Year is the only non-translated value (computed at render time so the
 *   footer always reflects the current calendar year without a code change).
 *
 * Logical Tailwind classes only — no ml-/mr-/pl-/pr-/left-/right-. mx-auto,
 * px-*, and text-center are bidirectional by definition; flex-wrap + gap-* +
 * justify-center handle horizontal spacing locale-independently.
 */
interface FooterProps {
    showLinks?: boolean;
}

export function Footer({ showLinks = true }: FooterProps) {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <div className="mx-auto max-w-6xl px-4 py-7 text-center text-sm text-cyan-100/68">
            {showLinks && (
                <ul className="flex flex-wrap justify-center gap-2">
                    <li>
                        <a
                            href={t('common.footer.githubUrl')}
                            aria-label={t('common.footer.githubAriaLabel')}
                            className="inline-flex items-center gap-2 rounded border border-cyan-100/12 bg-cyan-50/5 px-3 py-1.5 transition-colors hover:border-cyan-100/28 hover:bg-cyan-50/10 hover:text-white"
                        >
                            <i
                                aria-hidden="true"
                                className="fa-brands fa-github text-cyan-200"
                            />
                            {t('common.footer.githubLinkText')}
                        </a>
                    </li>
                    <li>
                        <a
                            href={t('common.footer.linkedinUrl')}
                            aria-label={t('common.footer.linkedinAriaLabel')}
                            className="inline-flex items-center gap-2 rounded border border-cyan-100/12 bg-cyan-50/5 px-3 py-1.5 transition-colors hover:border-cyan-100/28 hover:bg-cyan-50/10 hover:text-white"
                        >
                            <i
                                aria-hidden="true"
                                className="fa-brands fa-linkedin text-cyan-200"
                            />
                            {t('common.footer.linkedinLinkText')}
                        </a>
                    </li>
                    <li>
                        <a
                            href={`mailto:${t('common.footer.email')}`}
                            aria-label={t('common.footer.emailAriaLabel')}
                            className="inline-flex items-center gap-2 rounded border border-cyan-100/12 bg-cyan-50/5 px-3 py-1.5 transition-colors hover:border-cyan-100/28 hover:bg-cyan-50/10 hover:text-white"
                        >
                            <i
                                aria-hidden="true"
                                className="fa-solid fa-envelope text-cyan-200"
                            />
                            {t('common.footer.emailLinkText')}
                        </a>
                    </li>
                    <li>
                        <a
                            href={t('common.footer.cvUrl')}
                            aria-label={t('common.footer.cvAriaLabel')}
                            className="inline-flex items-center gap-2 rounded border border-cyan-100/12 bg-cyan-50/5 px-3 py-1.5 transition-colors hover:border-cyan-100/28 hover:bg-cyan-50/10 hover:text-white"
                        >
                            <i
                                aria-hidden="true"
                                className="fa-solid fa-file-lines text-cyan-200"
                            />
                            {t('common.footer.cvLinkText')}
                        </a>
                    </li>
                </ul>
            )}
            <p className={showLinks ? 'mt-3 text-cyan-50/82' : 'text-cyan-50/82'}>
                {t('common.copyright')} {t('common.copyrightWord')}{' '}
                {currentYear} {t('common.attribution')}
                {'. '}
                {t('common.footer.allRightsReserved')}
            </p>
        </div>
    );
}
