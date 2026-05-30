import { useTranslation } from '@/hooks/useTranslation';

/**
 * What I make section — the Undaunted moment.
 *
 * Four paragraphs covering Undaunted's origin (Clubhouse-era community,
 * names selectively from Andrew's network), the megastructures-in-space
 * curiosity that links to the Habitat experience, and what Undaunted
 * is now. The fifth slot is the transparency note — the in-app
 * attribution surface for the Phase 2 code lift (the third surface of
 * the transparency commitment after README + commit message bodies).
 *
 * Transparency note styling: italic + smaller text + neutral-600 to
 * read as a footnote-style attribution rather than part of the main
 * prose flow.
 *
 * Copy is placeholder; Andrew refines.
 */
export function WhatIMake() {
    const { t } = useTranslation();

    return (
        <section className="mx-auto max-w-3xl border-t border-neutral-200 px-4 py-20">
            <h2 className="text-3xl font-semibold tracking-tight">
                {t('about.whatIMake.heading')}
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-relaxed text-neutral-700">
                <p>{t('about.whatIMake.paragraph1')}</p>
                <p>{t('about.whatIMake.paragraph2')}</p>
                <p>{t('about.whatIMake.paragraph3')}</p>
                <p>{t('about.whatIMake.paragraph4')}</p>
                <p className="text-base text-neutral-600 italic">
                    {t('about.whatIMake.transparencyNote')}
                </p>
            </div>
        </section>
    );
}
