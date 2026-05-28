import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';

/**
 * Landing page placeholder for Phase 4.
 *
 * v1 deliverable: a thin Brilliant landing that consumes AppLayout +
 * useTranslation, proving the i18n + a11y foundation works at the
 * site root (https://brilliant.test/).
 *
 * Phase 7 replaces this with the real landing — hero, multi-plane
 * scenes, inline Interstellar demo, etc.
 */
export default function Welcome() {
    const { t } = useTranslation();

    return (
        <AppLayout pageTitle={t('landing.placeholder.title')}>
            <section className="mx-auto max-w-3xl px-4 py-16">
                <h1 className="text-4xl font-bold tracking-tight">
                    {t('landing.placeholder.title')}
                </h1>
                <p className="mt-4 text-lg text-neutral-700">
                    {t('landing.placeholder.subtitle')}
                </p>
                <p className="mt-8">
                    <a
                        href="https://github.com/andrewkhartley/brilliant-app"
                        className="text-blue-600 underline focus-visible:outline-blue-600"
                    >
                        {t('landing.placeholder.commitsBadge')}
                    </a>
                </p>
            </section>
        </AppLayout>
    );
}
