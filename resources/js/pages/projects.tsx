import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';

export default function ProjectsPage() {
    const { t } = useTranslation();

    return (
        <AppLayout pageTitle={t('projects.pageTitle')}>
            <section className="relative overflow-hidden bg-[#08111f] text-white">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(125,211,252,0.16),transparent_30%),radial-gradient(circle_at_16%_74%,rgba(168,85,247,0.1),transparent_28%),linear-gradient(135deg,rgba(8,17,31,0.95),rgba(15,23,42,0.98))]" />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.34)_1px,transparent_1px)] bg-size-[46px_46px] opacity-18"
                />

                <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-24">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold tracking-[0.28em] text-cyan-200/75 uppercase">
                            {t('projects.pageTitle')}
                        </p>
                        <h1 className="mt-4 text-4xl font-semibold tracking-normal text-white sm:text-6xl">
                            {t('projects.heading')}
                        </h1>
                        <p className="mt-5 text-lg leading-8 text-cyan-50/76">
                            {t('projects.intro')}
                        </p>
                    </div>

                    <div className="mt-12 grid gap-5 md:grid-cols-2">
                        <ProjectCard
                            kicker={t('projects.cards.alexandria.kicker')}
                            title={t('projects.cards.alexandria.title')}
                            body={t('projects.cards.alexandria.body')}
                        />
                        <ProjectCard
                            kicker={t('projects.cards.undaunted.kicker')}
                            title={t('projects.cards.undaunted.title')}
                            body={t('projects.cards.undaunted.body')}
                        />
                    </div>

                    <p className="mt-8 max-w-3xl rounded border border-cyan-100/14 bg-cyan-50/7 p-4 text-sm leading-7 font-semibold text-cyan-50/82 shadow-lg shadow-black/20">
                        {t('projects.note')}
                    </p>
                </div>
            </section>
        </AppLayout>
    );
}

function ProjectCard({
    body,
    kicker,
    title,
}: {
    body: string;
    kicker: string;
    title: string;
}) {
    return (
        <article className="rounded-lg border border-cyan-100/14 bg-slate-950/62 p-6 shadow-2xl shadow-black/30 backdrop-blur-md">
            <p className="text-xs font-semibold tracking-[0.22em] text-cyan-200/78 uppercase">
                {kicker}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-normal text-white">
                {title}
            </h2>
            <p className="mt-4 text-sm leading-7 text-cyan-50/72">{body}</p>
        </article>
    );
}
