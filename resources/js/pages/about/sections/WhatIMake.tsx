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
        <section className="relative overflow-hidden border-t border-cyan-100/15 bg-[#08111f] text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_82%,rgba(34,211,238,0.1),transparent_24%),linear-gradient(135deg,rgba(8,17,31,0.92),rgba(15,23,42,0.97))]" />
            <div className="relative mx-auto max-w-3xl px-4 py-20">
                <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                    {t('about.whatIMake.heading')}
                </h2>
                <div className="mt-8 space-y-6 text-lg leading-relaxed text-slate-200">
                    <p>{t('about.whatIMake.paragraph1')}</p>
                    <p>{t('about.whatIMake.paragraph2')}</p>
                    <p>{t('about.whatIMake.paragraph3')}</p>
                    <p>{t('about.whatIMake.paragraph4')}</p>
                    <p className="text-base text-cyan-100/58 italic">
                        {t('about.whatIMake.transparencyNote')}
                    </p>
                </div>
            </div>
        </section>
    );
}
