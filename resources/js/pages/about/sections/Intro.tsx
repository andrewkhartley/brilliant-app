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
        <section className="relative overflow-hidden bg-[#08111f] text-white">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,rgba(125,211,252,0.16),transparent_28%),radial-gradient(circle_at_18%_78%,rgba(34,211,238,0.1),transparent_24%),linear-gradient(135deg,rgba(8,17,31,0.88),rgba(15,23,42,0.96))]" />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.42)_1px,transparent_1px)] [background-size:42px_42px] opacity-40"
            />
            <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
                <h1 className="max-w-3xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                    {t('about.intro.heading')}
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-200">
                    {t('about.intro.opening')}
                </p>
                <div
                    role="img"
                    aria-label={t('about.intro.photoAlt')}
                    className="mt-10 flex aspect-[4/5] w-full max-w-sm items-center justify-center rounded-lg border border-cyan-100/15 bg-slate-950/72 text-sm text-cyan-100/58 shadow-2xl shadow-black/35 backdrop-blur-md"
                >
                    {t('about.intro.photoPlaceholderLabel')}
                </div>
            </div>
        </section>
    );
}
