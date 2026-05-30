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
            <section className="mx-auto max-w-5xl px-4 py-16">
                <h1 className="text-4xl font-bold tracking-tight">
                    {t('playground.hub.title')}
                </h1>
                <p className="mt-4 text-lg text-neutral-700">
                    {t('playground.hub.intro')}
                </p>

                <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <ExperienceCard
                        href="/playground/interstellar"
                        title={t('playground.hub.cards.interstellar.title')}
                        description={t(
                            'playground.hub.cards.interstellar.description',
                        )}
                    />
                    <ExperienceCard
                        href="/playground/cruise"
                        title={t('playground.hub.cards.cruise.title')}
                        description={t(
                            'playground.hub.cards.cruise.description',
                        )}
                    />
                    <ExperienceCard
                        href="/playground/habitat"
                        title={t('playground.hub.cards.habitat.title')}
                        description={t(
                            'playground.hub.cards.habitat.description',
                        )}
                    />
                </div>
            </section>
        </AppLayout>
    );
}
