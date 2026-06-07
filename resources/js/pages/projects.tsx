import { Link } from '@inertiajs/react';

import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { AppLayout } from '@/layouts/AppLayout';

const ALEXANDRIA_FEATURES = ['schema', 'capture', 'ai'] as const;

const ALEXANDRIA_SCREENSHOTS = [
    {
        id: 'landing',
        src: '/assets/projects/alexandria/alexandria-landing.webp',
    },
    {
        id: 'blueprints',
        src: '/assets/projects/alexandria/alexandria-blueprints.webp',
    },
    {
        id: 'notes',
        src: '/assets/projects/alexandria/alexandria-notes.webp',
    },
    {
        id: 'aiReview',
        src: '/assets/projects/alexandria/alexandria-ai-review.webp',
    },
] as const;

const UNDAUNTED_LINKS = [
    {
        id: 'habitat',
        href: '/playground/habitat',
        icon: 'fa-solid fa-dharmachakra',
    },
    {
        id: 'cruise',
        href: '/playground/cruise',
        icon: 'fa-solid fa-route',
    },
    {
        id: 'interstellar',
        href: '/playground/interstellar',
        icon: 'fa-solid fa-rocket',
    },
] as const;

export default function ProjectsPage() {
    const { t } = useTranslation();
    const [activeScreenshotIndex, setActiveScreenshotIndex] = useState<
        number | null
    >(null);
    const activeScreenshot =
        activeScreenshotIndex === null
            ? null
            : ALEXANDRIA_SCREENSHOTS[activeScreenshotIndex];
    const showPreviousScreenshot = useCallback(() => {
        setActiveScreenshotIndex((index) =>
            index === null
                ? null
                : (index - 1 + ALEXANDRIA_SCREENSHOTS.length) %
                  ALEXANDRIA_SCREENSHOTS.length,
        );
    }, []);
    const showNextScreenshot = useCallback(() => {
        setActiveScreenshotIndex((index) =>
            index === null
                ? null
                : (index + 1) % ALEXANDRIA_SCREENSHOTS.length,
        );
    }, []);

    useEffect(() => {
        if (activeScreenshotIndex === null) {
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
                setActiveScreenshotIndex(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        activeScreenshotIndex,
        showNextScreenshot,
        showPreviousScreenshot,
    ]);

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
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden border-t border-cyan-100/14 bg-[#08111f] text-white">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-cyan-200/74 to-transparent" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_20%,rgba(34,211,238,0.12),transparent_28%),linear-gradient(180deg,rgba(8,17,31,0.98),rgba(15,23,42,0.98))]" />

                <div className="relative mx-auto max-w-6xl px-4 py-16 sm:py-20">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.382fr)_minmax(0,0.618fr)] lg:items-start">
                        <ProjectIntro
                            body={[
                                t('projects.alexandria.bodyA'),
                                t('projects.alexandria.bodyB'),
                                t('projects.alexandria.bodyC'),
                            ]}
                            kicker={t('projects.alexandria.kicker')}
                            title={t('projects.alexandria.heading')}
                            intro={
                                <ItalicPhrase
                                    text={t('projects.alexandria.intro')}
                                    phrase={t('projects.alexandria.bookTitle')}
                                />
                            }
                        />

                        <div className="space-y-5">
                            <div className="grid gap-3 sm:grid-cols-3">
                                {ALEXANDRIA_FEATURES.map((feature) => (
                                    <FeatureCard
                                        key={feature}
                                        title={t(
                                            `projects.alexandria.features.${feature}.title`,
                                        )}
                                        body={t(
                                            `projects.alexandria.features.${feature}.body`,
                                        )}
                                    />
                                ))}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {ALEXANDRIA_SCREENSHOTS.map(
                                    (screenshot, index) => (
                                        <button
                                            key={screenshot.id}
                                            type="button"
                                            onClick={() =>
                                                setActiveScreenshotIndex(index)
                                            }
                                            className="group block w-full cursor-pointer overflow-hidden rounded-lg border border-cyan-100/14 bg-slate-950/72 text-start shadow-xl shadow-black/24 transition hover:-translate-y-0.5 hover:border-cyan-200/40 focus-visible:ring-2 focus-visible:ring-cyan-100 focus-visible:outline-none"
                                        >
                                            <img
                                                src={screenshot.src}
                                                alt={t(
                                                    `projects.alexandria.screenshots.${screenshot.id}.alt`,
                                                )}
                                                loading="lazy"
                                                decoding="async"
                                                className="aspect-[16/9] w-full object-cover object-top opacity-90 saturate-110 transition duration-200 group-hover:scale-[1.015] group-hover:opacity-100"
                                            />
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

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

            {activeScreenshot && (
                <ImageViewer
                    alt={t(
                        `projects.alexandria.screenshots.${activeScreenshot.id}.alt`,
                    )}
                    caption={t(
                        `projects.alexandria.screenshots.${activeScreenshot.id}.caption`,
                    )}
                    closeLabel={t('projects.alexandria.screenshots.close')}
                    nextLabel={t('projects.alexandria.screenshots.next')}
                    onClose={() => setActiveScreenshotIndex(null)}
                    onNext={showNextScreenshot}
                    onPrevious={showPreviousScreenshot}
                    position={t('projects.alexandria.screenshots.position', {
                        current: (activeScreenshotIndex ?? 0) + 1,
                        total: ALEXANDRIA_SCREENSHOTS.length,
                    })}
                    previousLabel={t(
                        'projects.alexandria.screenshots.previous',
                    )}
                    src={activeScreenshot.src}
                    title={t(
                        `projects.alexandria.screenshots.${activeScreenshot.id}.title`,
                    )}
                />
            )}
        </AppLayout>
    );
}

function ProjectIntro({
    align = 'left',
    body,
    intro,
    kicker,
    title,
}: {
    align?: 'left' | 'right';
    body: string[];
    intro: ReactNode;
    kicker: string;
    title: string;
}) {
    return (
        <div className={align === 'right' ? 'lg:text-right' : undefined}>
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
                            <i
                                aria-hidden="true"
                                className="fa-solid fa-xmark"
                            />
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
                            <i
                                aria-hidden="true"
                                className="fa-solid fa-arrow-left"
                            />
                        </button>
                        <button
                            type="button"
                            aria-label={nextLabel}
                            onClick={onNext}
                            className="inline-flex size-10 cursor-pointer items-center justify-center rounded border border-cyan-100/12 bg-cyan-50/5 text-cyan-100 transition-colors hover:bg-cyan-50/12 hover:text-white"
                        >
                            <i
                                aria-hidden="true"
                                className="fa-solid fa-arrow-right"
                            />
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
