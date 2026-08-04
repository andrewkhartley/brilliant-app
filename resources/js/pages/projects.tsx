import { Link } from '@inertiajs/react';

import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';

const SWINGERS_FEATURES = ['reconciliation', 'multivenue', 'realtime'] as const;
const ALEXANDRIA_FEATURES = ['schema', 'capture', 'ai'] as const;
const REFERENCE_CARDS = [
    'futureSystems',
    'explorableExplanations',
    'activeLearning',
] as const;
const PUBLIC_GOOD_CARDS = [
    { id: 'myco', locked: true },
    { id: 'sam', locked: true },
    { id: 'empoweredPublic', locked: false },
] as const;

const ALEXANDRIA_SCREENSHOTS = [
    { id: 'landing', src: '/assets/projects/alexandria/alexandria-landing.webp' },
    {
        id: 'blueprints',
        src: '/assets/projects/alexandria/alexandria-blueprints.webp',
    },
    { id: 'notes', src: '/assets/projects/alexandria/alexandria-notes.webp' },
    {
        id: 'aiReview',
        src: '/assets/projects/alexandria/alexandria-ai-review.webp',
    },
] as const;

const SWINGERS_SCREENSHOTS = [
    { id: 'excelCashup', src: '/assets/projects/swingers/hub-excel-cashup.webp' },
    {
        id: 'reconciliation',
        src: '/assets/projects/swingers/hub-reconciliation.webp',
    },
    { id: 'calendar', src: '/assets/projects/swingers/hub-calendar.webp' },
    { id: 'cashupEasol', src: '/assets/projects/swingers/hub-cashup-easol.webp' },
    { id: 'staffBanks', src: '/assets/projects/swingers/hub-staff-banks.webp' },
    { id: 'sop', src: '/assets/projects/swingers/hub-sop.webp' },
] as const;

/**
 * Every clickable screenshot gallery on the page, keyed by id. The lightbox
 * tracks { gallery, index } so one viewer serves all of them; captions/alt/
 * titles come from each gallery's i18n prefix + the shot id.
 */
const GALLERIES = {
    alexandria: {
        i18n: 'projects.alexandria.screenshots',
        shots: ALEXANDRIA_SCREENSHOTS,
    },
    swingers: {
        i18n: 'projects.swingers.screenshots',
        shots: SWINGERS_SCREENSHOTS,
    },
} as const;
type GalleryId = keyof typeof GALLERIES;

const UNDAUNTED_LINKS = [
    { id: 'habitat', href: '/playground/habitat', icon: 'fa-solid fa-dharmachakra' },
    { id: 'cruise', href: '/playground/cruise', icon: 'fa-solid fa-route' },
    { id: 'interstellar', href: '/playground/interstellar', icon: 'fa-solid fa-rocket' },
] as const;

export default function ProjectsPage() {
    const { t } = useTranslation();
    const [active, setActive] = useState<{
        gallery: GalleryId;
        index: number;
    } | null>(null);
    const activeShot = active ? GALLERIES[active.gallery].shots[active.index] : null;

    const showPreviousScreenshot = useCallback(() => {
        setActive((current) => {
            if (current === null) {
                return null;
            }

            const total = GALLERIES[current.gallery].shots.length;

            return { ...current, index: (current.index - 1 + total) % total };
        });
    }, []);
    const showNextScreenshot = useCallback(() => {
        setActive((current) => {
            if (current === null) {
                return null;
            }

            const total = GALLERIES[current.gallery].shots.length;

            return { ...current, index: (current.index + 1) % total };
        });
    }, []);

    useEffect(() => {
        if (active === null) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                showPreviousScreenshot();
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                showNextScreenshot();
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                setActive(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [active, showNextScreenshot, showPreviousScreenshot]);

    return (
        <AppLayout pageTitle={t('projects.pageTitle')}>
            <section className="relative overflow-hidden bg-[#08111f] text-white">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(125,211,252,0.18),transparent_30%),radial-gradient(circle_at_18%_66%,rgba(251,191,36,0.1),transparent_26%),linear-gradient(135deg,rgba(8,17,31,0.96),rgba(15,23,42,0.98))]" />
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.32)_1px,transparent_1px)] bg-size-[46px_46px] opacity-18"
                />

                <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-24">
                    <div className="max-w-4xl">
                        <p className="text-xs font-semibold tracking-[0.28em] text-cyan-200/75 uppercase">
                            {t('projects.pageTitle')}
                        </p>
                        <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-normal text-white sm:text-6xl">
                            {t('projects.heading')}
                        </h1>
                        <p className="mt-5 max-w-3xl text-lg leading-8 text-cyan-50/76">
                            {t('projects.intro')}
                        </p>
                        <p className="mt-4 max-w-3xl text-base leading-8 text-cyan-50/64">
                            {t('projects.introBio')}
                        </p>
                    </div>
                </div>
            </section>

            <ProjectSection accent="cyan">
                <div className="max-w-3xl">
                    <p className="text-xs font-semibold tracking-[0.26em] text-cyan-200/76 uppercase">
                        {t('projects.publicGood.kicker')}
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                        {t('projects.publicGood.heading')}
                    </h2>
                    <p className="mt-5 text-base leading-8 text-cyan-50/76">
                        {t('projects.publicGood.intro')}
                    </p>
                </div>
                <div className="mt-8 grid gap-4 lg:grid-cols-3">
                    {PUBLIC_GOOD_CARDS.map((card) => (
                        <PublicGoodCard
                            key={card.id}
                            locked={card.locked}
                            badge={t(
                                `projects.publicGood.cards.${card.id}.badge`,
                            )}
                            title={t(
                                `projects.publicGood.cards.${card.id}.title`,
                            )}
                            tagline={t(
                                `projects.publicGood.cards.${card.id}.tagline`,
                            )}
                            body={t(`projects.publicGood.cards.${card.id}.body`)}
                            footer={t(
                                `projects.publicGood.cards.${card.id}.footer`,
                            )}
                        />
                    ))}
                </div>
            </ProjectSection>

            <ProjectSection accent="amber" background="#0a111d">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,0.382fr)_minmax(0,0.618fr)] lg:items-start">
                    <ProjectIntro
                        kicker={t('projects.swingers.kicker')}
                        title={t('projects.swingers.heading')}
                        intro={t('projects.swingers.intro')}
                        body={[
                            t('projects.swingers.bodyA'),
                            t('projects.swingers.bodyB'),
                            t('projects.swingers.bodyC'),
                        ]}
                    />
                    <div className="space-y-5">
                        <TechLine>{t('projects.swingers.tech')}</TechLine>
                        <FeatureRow
                            ids={SWINGERS_FEATURES}
                            i18nPrefix="projects.swingers.features"
                        />
                        <ScreenshotGrid
                            shots={SWINGERS_SCREENSHOTS}
                            i18nPrefix="projects.swingers.screenshots"
                            onOpen={(index) =>
                                setActive({ gallery: 'swingers', index })
                            }
                        />
                    </div>
                </div>
            </ProjectSection>

            <ProjectSection accent="cyan">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,0.382fr)_minmax(0,0.618fr)] lg:items-start">
                    <ProjectIntro
                        kicker={t('projects.alexandria.kicker')}
                        title={t('projects.alexandria.heading')}
                        intro={
                            <ItalicPhrase
                                text={t('projects.alexandria.intro')}
                                phrase={t('projects.alexandria.bookTitle')}
                            />
                        }
                        body={[
                            t('projects.alexandria.bodyA'),
                            t('projects.alexandria.bodyB'),
                            t('projects.alexandria.bodyC'),
                        ]}
                    />
                    <div className="space-y-5">
                        <FeatureRow
                            ids={ALEXANDRIA_FEATURES}
                            i18nPrefix="projects.alexandria.features"
                        />
                        <ScreenshotGrid
                            shots={ALEXANDRIA_SCREENSHOTS}
                            i18nPrefix="projects.alexandria.screenshots"
                            onOpen={(index) =>
                                setActive({ gallery: 'alexandria', index })
                            }
                        />
                    </div>
                </div>
            </ProjectSection>

            <section className="relative overflow-hidden border-t border-cyan-100/14 bg-[#0a111d] text-white">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-200/70 to-transparent" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(251,191,36,0.12),transparent_28%),radial-gradient(circle_at_78%_78%,rgba(34,211,238,0.12),transparent_30%),linear-gradient(180deg,rgba(10,17,29,0.98),rgba(8,17,31,0.98))]" />

                <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.618fr)_minmax(0,0.382fr)] lg:items-start">
                        <div className="space-y-5">
                            <div className="rounded-xl border border-amber-100/18 bg-[#171107]/72 p-5 shadow-2xl shadow-black/28">
                                <div className="space-y-4 text-sm leading-7 text-amber-50/76">
                                    <p>{t('projects.undaunted.bodyA')}</p>
                                    <p>{t('projects.undaunted.bodyB')}</p>
                                    <p>{t('projects.undaunted.bodyC')}</p>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                {UNDAUNTED_LINKS.map((link) => (
                                    <Link
                                        key={link.id}
                                        href={link.href}
                                        className="group rounded-lg border border-cyan-100/14 bg-slate-950/62 p-4 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:border-cyan-200/38 hover:bg-cyan-50/8 focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:outline-none"
                                    >
                                        <span className="grid size-10 place-items-center rounded-full border border-cyan-100/18 bg-cyan-200/12 text-cyan-100 transition group-hover:border-cyan-100/36 group-hover:bg-cyan-200/18">
                                            <i
                                                aria-hidden="true"
                                                className={link.icon}
                                            />
                                        </span>
                                        <h3 className="mt-4 text-sm font-semibold text-white">
                                            {t(
                                                `projects.undaunted.links.${link.id}.title`,
                                            )}
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-cyan-50/68">
                                            {t(
                                                `projects.undaunted.links.${link.id}.body`,
                                            )}
                                        </p>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="lg:text-right">
                            <UndauntedBrandLockup />
                            <h2 className="mt-5 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                                {t('projects.undaunted.heading')}
                            </h2>
                            <p className="mt-5 text-base leading-8 font-semibold text-cyan-50/82">
                                {t('projects.undaunted.intro')}
                            </p>
                            <p className="mt-5 text-sm leading-7 text-cyan-50/72">
                                {t('projects.note')}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <ProjectSection accent="cyan">
                <div className="grid gap-10 lg:grid-cols-[minmax(0,0.382fr)_minmax(0,0.618fr)] lg:items-start">
                    <div>
                        <p className="text-xs font-semibold tracking-[0.26em] text-cyan-200/76 uppercase">
                            {t('projects.references.kicker')}
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                            {t('projects.references.heading')}
                        </h2>
                        <p className="mt-5 text-base leading-8 font-semibold text-cyan-50/82">
                            {t('projects.references.intro')}
                        </p>
                    </div>

                    <FeatureRow
                        ids={REFERENCE_CARDS}
                        i18nPrefix="projects.references.cards"
                    />
                </div>
            </ProjectSection>

            {active && activeShot && (
                <ImageViewer
                    alt={t(
                        `${GALLERIES[active.gallery].i18n}.${activeShot.id}.alt`,
                    )}
                    caption={t(
                        `${GALLERIES[active.gallery].i18n}.${activeShot.id}.caption`,
                    )}
                    closeLabel={t('projects.gallery.close')}
                    nextLabel={t('projects.gallery.next')}
                    onClose={() => setActive(null)}
                    onNext={showNextScreenshot}
                    onPrevious={showPreviousScreenshot}
                    position={t('projects.gallery.position', {
                        current: active.index + 1,
                        total: GALLERIES[active.gallery].shots.length,
                    })}
                    previousLabel={t('projects.gallery.previous')}
                    src={activeShot.src}
                    title={t(
                        `${GALLERIES[active.gallery].i18n}.${activeShot.id}.title`,
                    )}
                />
            )}
        </AppLayout>
    );
}

/**
 * Shared section shell for a project block: border, background, top hairline,
 * and a soft accent glow. `accent` only picks the hairline/glow hue.
 */
function ProjectSection({
    accent,
    background = '#08111f',
    children,
}: {
    accent: 'cyan' | 'amber';
    background?: string;
    children: ReactNode;
}) {
    const hairline =
        accent === 'amber' ? 'via-amber-200/60' : 'via-cyan-200/74';
    const glow =
        accent === 'amber'
            ? 'radial-gradient(circle_at_18%_20%,rgba(251,191,36,0.1),transparent_28%),radial-gradient(circle_at_80%_78%,rgba(34,211,238,0.1),transparent_30%)'
            : 'radial-gradient(circle_at_82%_20%,rgba(34,211,238,0.12),transparent_28%)';

    return (
        <section
            className="relative overflow-hidden border-t border-cyan-100/14 text-white"
            style={{ backgroundColor: background }}
        >
            <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent to-transparent ${hairline}`}
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: glow.replace(/_/g, ' ') }}
            />
            <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
                {children}
            </div>
        </section>
    );
}

function ProjectIntro({
    body,
    intro,
    kicker,
    title,
}: {
    body: string[];
    intro: ReactNode;
    kicker: string;
    title: string;
}) {
    return (
        <div>
            <p className="text-xs font-semibold tracking-[0.26em] text-cyan-200/76 uppercase">
                {kicker}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                {title}
            </h2>
            <p className="mt-5 text-base leading-8 font-semibold text-cyan-50/82">
                {intro}
            </p>
            {body.length > 0 && (
                <div className="mt-6 space-y-4 text-sm leading-7 text-cyan-50/72">
                    {body.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                    ))}
                </div>
            )}
        </div>
    );
}

function TechLine({ children }: { children: ReactNode }) {
    return (
        <p className="text-xs font-medium tracking-wide text-cyan-200/60">
            {children}
        </p>
    );
}

function FeatureRow({
    ids,
    i18nPrefix,
}: {
    ids: readonly string[];
    i18nPrefix: string;
}) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-3 sm:grid-cols-3">
            {ids.map((id) => (
                <FeatureCard
                    key={id}
                    title={t(`${i18nPrefix}.${id}.title`)}
                    body={t(`${i18nPrefix}.${id}.body`)}
                />
            ))}
        </div>
    );
}

function ScreenshotGrid({
    i18nPrefix,
    onOpen,
    shots,
}: {
    i18nPrefix: string;
    onOpen: (index: number) => void;
    shots: ReadonlyArray<{ id: string; src: string }>;
}) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {shots.map((shot, index) => (
                <button
                    key={shot.id}
                    type="button"
                    onClick={() => onOpen(index)}
                    className="group block w-full cursor-pointer overflow-hidden rounded-lg border border-cyan-100/14 bg-slate-950/72 text-start shadow-xl shadow-black/24 transition hover:-translate-y-0.5 hover:border-cyan-200/40 focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:outline-none"
                >
                    <img
                        src={shot.src}
                        alt={t(`${i18nPrefix}.${shot.id}.alt`)}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[16/9] w-full object-cover object-top opacity-90 saturate-110 transition duration-200 group-hover:scale-[1.015] group-hover:opacity-100"
                    />
                </button>
            ))}
        </div>
    );
}

function ItalicPhrase({ phrase, text }: { phrase: string; text: string }) {
    const phraseIndex = text.indexOf(phrase);

    if (phraseIndex === -1) {
        return <>{text}</>;
    }

    return (
        <>
            {text.slice(0, phraseIndex)}
            <em>{phrase}</em>
            {text.slice(phraseIndex + phrase.length)}
        </>
    );
}

function FeatureCard({ body, title }: { body: string; title: string }) {
    return (
        <article className="rounded-lg border border-cyan-100/14 bg-slate-950/68 p-4 shadow-xl shadow-black/22">
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-cyan-50/68">{body}</p>
        </article>
    );
}

function PublicGoodCard({
    badge,
    body,
    footer,
    locked,
    tagline,
    title,
}: {
    badge: string;
    body: string;
    footer: string;
    locked: boolean;
    tagline: string;
    title: string;
}) {
    const footerClass = locked
        ? 'mt-auto pt-4 text-xs font-semibold tracking-wide text-amber-200/80'
        : 'mt-auto pt-4 text-xs leading-6 text-cyan-100/55';
    const badgeClass = locked
        ? 'inline-flex w-fit items-center gap-2 rounded-full border border-amber-200/30 bg-amber-300/12 px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-[0.16em] text-amber-100/90 uppercase'
        : 'inline-flex w-fit items-center gap-2 rounded-full border border-cyan-100/18 bg-cyan-200/10 px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-[0.16em] text-cyan-100/80 uppercase';

    return (
        <article className="flex flex-col rounded-xl border border-cyan-100/16 bg-slate-950/62 p-6 shadow-xl shadow-black/24">
            <span className={badgeClass}>
                {locked ? (
                    <i
                        aria-hidden="true"
                        className="fa-solid fa-lock text-[0.6rem]"
                    />
                ) : null}
                {badge}
            </span>
            <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm font-semibold text-cyan-100/80">
                {tagline}
            </p>
            <p className="mt-3 text-sm leading-7 text-cyan-50/72">{body}</p>
            <p className={footerClass}>{footer}</p>
        </article>
    );
}

function UndauntedBrandLockup() {
    return (
        <div className="flex items-center justify-start gap-3 lg:justify-end">
            <img
                src="/assets/brand/undaunted/logo.svg"
                alt=""
                aria-hidden="true"
                className="h-12 w-12 shrink-0 opacity-95"
            />
            <img
                src="/assets/brand/undaunted/logo-text.svg"
                alt="Undaunted"
                className="h-7.5 w-auto opacity-92"
            />
        </div>
    );
}

function ImageViewer({
    alt,
    caption,
    closeLabel,
    nextLabel,
    onClose,
    onNext,
    onPrevious,
    position,
    previousLabel,
    src,
    title,
}: {
    alt: string;
    caption: string;
    closeLabel: string;
    nextLabel: string;
    onClose: () => void;
    onNext: () => void;
    onPrevious: () => void;
    position: string;
    previousLabel: string;
    src: string;
    title: string;
}) {
    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/86 p-4 backdrop-blur-md"
        >
            <button
                type="button"
                aria-label={closeLabel}
                onClick={onClose}
                className="absolute inset-0 cursor-default"
            />
            <div className="relative grid max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-lg border border-cyan-100/18 bg-[#07101d] shadow-2xl shadow-black/60 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="flex min-h-0 items-center justify-center bg-black/35 p-3">
                    <img
                        src={src}
                        alt={alt}
                        className="max-h-[82vh] w-auto max-w-full rounded object-contain"
                    />
                </div>
                <aside className="border-t border-cyan-100/12 p-5 text-cyan-50/78 lg:border-s lg:border-t-0">
                    <div className="flex items-start justify-between gap-4">
                        <p className="text-xs font-semibold tracking-[0.2em] text-cyan-200/78 uppercase">
                            {position}
                        </p>
                        <button
                            type="button"
                            aria-label={closeLabel}
                            onClick={onClose}
                            className="inline-flex size-9 cursor-pointer items-center justify-center rounded border border-cyan-100/12 bg-cyan-50/5 text-cyan-100 transition-colors hover:bg-cyan-50/12 hover:text-white"
                        >
                            <i aria-hidden="true" className="fa-solid fa-xmark" />
                        </button>
                    </div>
                    <h3 className="mt-8 text-2xl font-semibold text-white">
                        {title}
                    </h3>
                    <p className="mt-4 text-sm leading-7">{caption}</p>
                    <div className="mt-8 flex gap-3">
                        <button
                            type="button"
                            aria-label={previousLabel}
                            onClick={onPrevious}
                            className="inline-flex size-10 cursor-pointer items-center justify-center rounded border border-cyan-100/12 bg-cyan-50/5 text-cyan-100 transition-colors hover:bg-cyan-50/12 hover:text-white"
                        >
                            <i aria-hidden="true" className="fa-solid fa-arrow-left" />
                        </button>
                        <button
                            type="button"
                            aria-label={nextLabel}
                            onClick={onNext}
                            className="inline-flex size-10 cursor-pointer items-center justify-center rounded border border-cyan-100/12 bg-cyan-50/5 text-cyan-100 transition-colors hover:bg-cyan-50/12 hover:text-white"
                        >
                            <i aria-hidden="true" className="fa-solid fa-arrow-right" />
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
