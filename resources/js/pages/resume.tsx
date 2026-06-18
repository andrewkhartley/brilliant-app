import { ResumeSection } from '@/components/resume/ResumeSection';
import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';

/**
 * Résumé structure: ordering + which line IDs belong to each group. Strings
 * live in lang/en/resume.php (key-based authoring). `kind` decides whether the
 * header renders as a plain section title or a job header. Mirrors the
 * structure-as-typed-const pattern used by projects.tsx.
 */
const RESUME = [
    { id: 'summary', kind: 'section', lineIds: ['summary'] },
    {
        id: 'skills',
        kind: 'section',
        lineIds: ['languages', 'systems', 'ai', 'integrations', 'additional'],
    },
    {
        id: 'alexandria',
        kind: 'job',
        lineIds: ['intro', 'eav', 'llm', 'migration', 'capture'],
    },
    {
        id: 'signal',
        kind: 'job',
        lineIds: ['intro', 'auth', 'zip', 'decoy', 'myco'],
    },
    {
        id: 'swingersLead',
        kind: 'job',
        lineIds: [
            'intro',
            'savings',
            'architecture',
            'releases',
            'reconciliation',
            'azure',
            'multivenue',
        ],
    },
    {
        id: 'swingersAnalyst',
        kind: 'job',
        lineIds: ['intro', 'automate', 'toast', 'golfDiary', 'businessCase'],
    },
    { id: 'sodexo', kind: 'job', lineIds: ['concierge'] },
    { id: 'jetblue', kind: 'job', lineIds: ['safety'] },
    { id: 'disney', kind: 'job', lineIds: ['helpDesk', 'pmSystem'] },
    { id: 'education', kind: 'section', lineIds: ['degrees'] },
    { id: 'contact', kind: 'section', lineIds: ['relocation'] },
] as const;

export default function ResumePage() {
    const { t } = useTranslation();

    // One shared builder for every section's slider value text, e.g.
    // "30% corporate, 70% honest" — keeps the announcement consistent.
    const valueText = (corporate: number) =>
        t('resume.controls.valueText', {
            corporate,
            honest: 100 - corporate,
        });

    return (
        <AppLayout pageTitle={t('resume.pageTitle')}>
            <section className="relative overflow-hidden bg-[#08111f] text-white">
                <div className="relative mx-auto max-w-4xl px-4 py-20 sm:py-24">
                    <p className="text-xs font-semibold tracking-[0.28em] text-cyan-200/75 uppercase">
                        {t('resume.thesis.kicker')}
                    </p>
                    <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                        {t('resume.thesis.title')}
                    </h1>
                    <p className="mt-5 text-lg leading-8 text-cyan-50/76">
                        {t('resume.thesis.body')}
                    </p>
                    <p className="mt-3 text-sm text-cyan-100/60">
                        {t('resume.thesis.instruction')}
                    </p>
                </div>
            </section>

            <section className="relative bg-[#08111f] text-white">
                <div className="relative mx-auto max-w-4xl px-4 pb-24">
                    <div className="flex items-center justify-between border-b border-cyan-100/10 px-10 pb-3 text-xs font-semibold tracking-[0.16em] uppercase">
                        <span className="text-rose-300/80">
                            {t('resume.controls.corporateColumn')}
                        </span>
                        <span className="text-cyan-200/80">
                            {t('resume.controls.honestColumn')}
                        </span>
                    </div>

                    {RESUME.map((group) => {
                        const sectionName =
                            group.kind === 'section'
                                ? t(`resume.sections.${group.id}.heading`)
                                : t(`resume.sections.${group.id}.company`);

                        return (
                            <ResumeSection
                                key={group.id}
                                heading={
                                    group.kind === 'section'
                                        ? sectionName
                                        : undefined
                                }
                                company={
                                    group.kind === 'job'
                                        ? sectionName
                                        : undefined
                                }
                                role={
                                    group.kind === 'job'
                                        ? t(`resume.sections.${group.id}.role`)
                                        : undefined
                                }
                                dates={
                                    group.kind === 'job'
                                        ? t(`resume.sections.${group.id}.dates`)
                                        : undefined
                                }
                                location={
                                    group.kind === 'job'
                                        ? t(
                                              `resume.sections.${group.id}.location`,
                                          )
                                        : undefined
                                }
                                handleLabel={t('resume.controls.handleLabel', {
                                    section: sectionName,
                                })}
                                valueText={valueText}
                                lines={group.lineIds.map((lineId) => ({
                                    corporate: t(
                                        `resume.lines.${group.id}.${lineId}.corporate`,
                                    ),
                                    honest: t(
                                        `resume.lines.${group.id}.${lineId}.honest`,
                                    ),
                                }))}
                            />
                        );
                    })}

                    <FooterWink />
                </div>
            </section>
        </AppLayout>
    );
}

function FooterWink() {
    const { t } = useTranslation();

    return (
        <div className="mt-16 rounded-lg border border-cyan-100/14 bg-slate-950/60 p-6">
            <p className="text-sm leading-7 text-cyan-50/72">
                {t('resume.footer.cta')}
            </p>
            <a
                href={t('common.footer.cvUrl')}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded border border-cyan-200/44 bg-cyan-200/12 px-4 py-2.5 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-200/18 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
                <i
                    aria-hidden="true"
                    className="fa-solid fa-file-arrow-down text-cyan-200"
                />
                {t('resume.footer.cvLinkText')}
            </a>
        </div>
    );
}
