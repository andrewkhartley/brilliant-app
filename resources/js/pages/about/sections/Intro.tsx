import { useTranslation } from '@/hooks/useTranslation';

/**
 * Intro section — About page first impression.
 *
 * h1 + opening line + portrait photo slot. v1 ships with an empty
 * styled <div> placeholder for the photo (Andrew has not uploaded a
 * portrait yet). When the photo lands at /assets/about/portrait.png,
 * swap the <div> for an <img> tag — one-line edit, src already
 * documented here:
 *
 *   <img
 *       src="/assets/about/portrait.png"
 *       alt={t('about.intro.photoAlt')}
 *       className="mt-10 aspect-[4/5] w-full max-w-sm rounded-lg object-cover"
 *   />
 *
 * No top border: Intro is the first section after Nav. role="img" +
 * aria-label makes the placeholder accessible to AT users even with
 * the visible "Portrait coming" label.
 *
 * Copy is placeholder; Andrew refines.
 */
export function Intro() {
    const { t } = useTranslation();

    return (
        <section className="mx-auto max-w-3xl px-4 py-20">
            <h1 className="text-4xl font-bold tracking-tight">
                {t('about.intro.heading')}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-700">
                {t('about.intro.opening')}
            </p>
            <div
                role="img"
                aria-label={t('about.intro.photoAlt')}
                className="mt-10 flex aspect-[4/5] w-full max-w-sm items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-400 ring-1 ring-neutral-200"
            >
                {t('about.intro.photoPlaceholderLabel')}
            </div>
        </section>
    );
}
