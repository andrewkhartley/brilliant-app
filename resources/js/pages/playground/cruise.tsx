import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';

/**
 * /playground/cruise — Andrew's interplanetary trip planner (scaffold).
 *
 * Phase 10 T1 ships only the page shell + a count of destinations
 * loaded from the freshly-seeded `solar_system_facts` table. T3
 * replaces this with a full dnd-kit form (destination picker +
 * date picker + submit) and T5 wires the per-leg review page.
 */
type Destination = { code: string; name: string };

type Props = { destinations: Destination[] };

export default function CruisePage({ destinations }: Props) {
    const { t } = useTranslation();

    return (
        <AppLayout pageTitle={t('cruise.title')}>
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold">{t('cruise.title')}</h1>
                <p className="mt-4">{t('cruise.lead')}</p>
                <p className="mt-2 text-sm text-zinc-500">
                    {t('cruise.scaffoldNote', {
                        count: String(destinations.length),
                    })}
                </p>
            </div>
        </AppLayout>
    );
}
