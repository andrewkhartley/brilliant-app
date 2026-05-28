import { useTranslation } from '@/hooks/useTranslation';

/**
 * Site footer — bottom chrome composed by AppLayout.
 *
 * Renders (centered, thin top-bordered):
 * - Row 1: © + current year + em-dash separator + attribution name
 * - Row 2: source-availability note + cited-code attribution note (the
 *   transparency promise — Andrew's commit history is part of the work
 *   product, so the footer acknowledges that publicly on every page)
 * - Row 3: GitHub + Email contact links with aria-label accessible names
 *
 * Composition:
 * - AppLayout owns the <footer> semantic landmark wrapper; this component
 *   renders the inner content. Mirrors how Nav sits inside AppLayout's
 *   <header> — the layout owns landmarks, the component owns content.
 *
 * i18n:
 * - All user-facing strings flow through t() — including © glyph, separator,
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
export function Footer() {
    const { t } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-neutral-600">
            <p>
                {t('common.copyright')} {currentYear}
                {t('common.separator')}
                {t('common.attribution')}
            </p>
            <p className="mt-2">
                {t('common.footer.sourceAvailable')}{' '}
                {t('common.footer.sourceAttribution')}
            </p>
            <ul className="mt-3 flex flex-wrap justify-center gap-4">
                <li>
                    <a
                        href={t('common.footer.githubUrl')}
                        aria-label={t('common.footer.githubAriaLabel')}
                        className="hover:text-neutral-900"
                    >
                        {t('common.footer.githubLinkText')}
                    </a>
                </li>
                <li>
                    <a
                        href={`mailto:${t('common.footer.email')}`}
                        aria-label={t('common.footer.emailAriaLabel')}
                        className="hover:text-neutral-900"
                    >
                        {t('common.footer.emailLinkText')}
                    </a>
                </li>
            </ul>
        </div>
    );
}
