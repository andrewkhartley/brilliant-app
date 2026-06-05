import { useTranslation } from '@/hooks/useTranslation';

type CruisePossibilitiesContext = 'planner' | 'review';

interface CruisePossibilitiesSectionProps {
    context: CruisePossibilitiesContext;
}

const possibilityKeys = [
    'windows',
    'fuel',
    'missions',
    'community',
] as const;

export function CruisePossibilitiesSection({
    context,
}: CruisePossibilitiesSectionProps) {
    const { t } = useTranslation();

    return (
        <section className="relative overflow-hidden bg-[#171106] py-14 text-amber-50 sm:py-16">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(251,191,36,0.18),transparent_28%),radial-gradient(circle_at_16%_82%,rgba(245,158,11,0.12),transparent_26%),linear-gradient(180deg,rgba(30,20,6,0.92),rgba(12,10,6,0.96))]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(251,191,36,0.22)_1px,transparent_1px)] bg-size-[46px_46px] opacity-18" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-0.75 bg-linear-to-r from-transparent via-amber-200/76 to-transparent" />
            <div className="relative mx-auto max-w-6xl px-4">
                <div className="rounded-lg border border-amber-100/20 bg-amber-100/10 p-6 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-7">
                    <p className="text-xs font-semibold tracking-[0.24em] text-amber-200/78 uppercase">
                        {t(`cruise.possibilities.${context}.eyebrow`)}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-normal text-white sm:text-3xl">
                        {t(`cruise.possibilities.${context}.title`)}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-amber-50/76">
                        {t(`cruise.possibilities.${context}.body`)}
                    </p>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {possibilityKeys.map((key) => (
                            <article
                                key={key}
                                className="rounded-lg border border-amber-100/16 bg-[#140f08]/58 p-4 shadow-lg shadow-black/18"
                            >
                                <h3 className="text-sm font-semibold tracking-normal text-white">
                                    {t(
                                        `cruise.possibilities.items.${key}.title`,
                                    )}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-amber-50/72">
                                    {t(
                                        `cruise.possibilities.items.${key}.body`,
                                    )}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
