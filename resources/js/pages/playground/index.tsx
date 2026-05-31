import { ExperienceCard } from '@/components/ExperienceCard';
import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';

/**
 * Playground hub — entry point for the three playground experiences.
 *
 * Composes three ExperienceCards pointing to /playground/interstellar,
 * /playground/cruise, /playground/habitat. Those destinations 404
 * until their respective phases (8, 10, 11) ship; the hub itself is
 * the v1 deliverable.
 *
 * Spec 9.2 calls for "peek previews on hover" — deferred to Phase 13
 * (Polish). v1 ships the basic 3-card grid using ExperienceCard as-is.
 *
 * Copy is placeholder; Andrew refines.
 */
export default function PlaygroundIndex() {
    const { t } = useTranslation();

    return (
        <AppLayout pageTitle={t('playground.hub.title')}>
            <section className="relative min-h-[calc(100vh-13rem)] overflow-hidden bg-[#07101d] text-white">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_16%,rgba(125,211,252,0.18),transparent_30%),radial-gradient(circle_at_14%_72%,rgba(34,211,238,0.12),transparent_26%),linear-gradient(180deg,rgba(8,17,31,0.94),rgba(7,16,29,0.98)_72%,rgba(7,16,29,1))]" />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.34)_1px,transparent_1px)] [background-size:52px_52px] opacity-30"
                />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#07101d] to-transparent"
                />
                <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
                    <h1 className="text-4xl font-semibold tracking-normal text-white sm:text-5xl">
                        {t('playground.hub.title')}
                    </h1>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
                        {t('playground.hub.intro')}
                    </p>

                    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <ExperienceCard
                            href="/playground/interstellar"
                            title={t('playground.hub.cards.interstellar.title')}
                            description={t(
                                'playground.hub.cards.interstellar.description',
                            )}
                            imageSrc="/assets/img/bg/color-nebula.jpg"
                            imageAlt=""
                        />
                        <ExperienceCard
                            href="/playground/cruise"
                            title={t('playground.hub.cards.cruise.title')}
                            description={t(
                                'playground.hub.cards.cruise.description',
                            )}
                            imageSrc="/assets/img/bg/muted-nebula.png"
                            imageAlt=""
                        />
                        <ExperienceCard
                            href="/playground/habitat"
                            title={t('playground.hub.cards.habitat.title')}
                            description={t(
                                'playground.hub.cards.habitat.description',
                            )}
                            imageSrc="/assets/img/bg/cylinder.jpg"
                            imageAlt=""
                        />
                    </div>
                </div>
            </section>
        </AppLayout>
    );
}
