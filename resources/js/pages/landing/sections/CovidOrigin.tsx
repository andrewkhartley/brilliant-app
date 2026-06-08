import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useCallback, useEffect, useRef, useState } from 'react';

import { GlowPhrase } from '@/components/GlowPhrase';
import { useTranslation } from '@/hooks/useTranslation';

/**
 * Clubhouse origin section: how live audio rooms turned curiosity into the
 * work this site is trying to show. The visual area is intentionally built
 * with screenshot-ready frames so real Clubhouse/work images can replace the
 * abstract placeholders later.
 */
export function CovidOrigin() {
    const { t } = useTranslation();
    const sectionRef = useRef<HTMLElement>(null);
    const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(
        null,
    );
    const galleryItems: GalleryItem[] = [
        {
            src: '/assets/scenes/clubhouse/analytics-growth.png',
            title: t('landing.covidOrigin.gallery.analytics.title'),
            caption: t('landing.covidOrigin.gallery.analytics.caption'),
            alt: t('landing.covidOrigin.visual.analyticsAlt'),
        },
        {
            src: '/assets/scenes/clubhouse/mars-room.png',
            title: t('landing.covidOrigin.gallery.mars.title'),
            caption: t('landing.covidOrigin.gallery.mars.caption'),
            alt: t('landing.covidOrigin.visual.marsAlt'),
        },
        {
            src: '/assets/scenes/clubhouse/space-telescope-room.png',
            title: t('landing.covidOrigin.gallery.jamesWebb.title'),
            caption: t('landing.covidOrigin.gallery.jamesWebb.caption'),
            alt: t('landing.covidOrigin.visual.jamesWebbAlt'),
        },
        {
            src: '/assets/scenes/clubhouse/generation-ship-room.png',
            title: t('landing.covidOrigin.gallery.generationShip.title'),
            caption: t('landing.covidOrigin.gallery.generationShip.caption'),
            alt: t('landing.covidOrigin.visual.generationShipAlt'),
            linkHref: t('landing.covidOrigin.gallery.generationShip.linkHref'),
            linkLabel: t(
                'landing.covidOrigin.gallery.generationShip.linkLabel',
            ),
        },
    ];
    const activeGalleryItem =
        activeGalleryIndex === null ? null : galleryItems[activeGalleryIndex];
    const showPreviousImage = useCallback(() => {
        setActiveGalleryIndex((index) =>
            index === null
                ? null
                : (index - 1 + galleryItems.length) % galleryItems.length,
        );
    }, [galleryItems.length]);
    const showNextImage = useCallback(() => {
        setActiveGalleryIndex((index) =>
            index === null ? null : (index + 1) % galleryItems.length,
        );
    }, [galleryItems.length]);

    useEffect(() => {
        if (activeGalleryIndex === null) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                showPreviousImage();
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                showNextImage();
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                setActiveGalleryIndex(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeGalleryIndex, showNextImage, showPreviousImage]);

    useEffect(() => {
        const section = sectionRef.current;

        if (
            !section ||
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        const context = gsap.context(() => {
            gsap.fromTo(
                '[data-clubhouse-reveal]',
                { autoAlpha: 0, y: 28, filter: 'blur(10px)' },
                {
                    autoAlpha: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 0.85,
                    ease: 'power3.out',
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 70%',
                    },
                },
            );

            gsap.fromTo(
                '[data-clubhouse-card]',
                { autoAlpha: 0, y: 24, scale: 0.98 },
                {
                    autoAlpha: 1,
                    y: 0,
                    scale: 1,
                    duration: 0.72,
                    ease: 'power2.out',
                    stagger: 0.08,
                    scrollTrigger: {
                        trigger: '[data-clubhouse-gallery]',
                        start: 'top 78%',
                    },
                },
            );
        }, section);

        return () => context.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden bg-[#07101d] text-white"
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_78%_24%,rgba(168,85,247,0.14),transparent_30%),radial-gradient(circle_at_50%_88%,rgba(125,211,252,0.08),transparent_26%),linear-gradient(180deg,rgba(7,16,29,1),rgba(8,13,29,0.98)_42%,rgba(6,10,22,1))]" />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 [background-image:radial-gradient(circle,rgba(255,255,255,0.28)_1px,transparent_1px)] [background-size:48px_48px] opacity-20"
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-200/72 to-transparent" />
            <div className="pointer-events-none absolute inset-x-12 top-0 h-8 bg-cyan-200/12 blur-2xl" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
            <div className="pointer-events-none absolute inset-x-12 bottom-0 h-8 bg-cyan-200/10 blur-2xl" />

            <div className="relative mx-auto max-w-6xl px-4 py-20 text-white select-text sm:py-24">
                <div
                    data-clubhouse-reveal
                    className="max-w-5xl text-left"
                >
                    <p className="text-xs font-semibold tracking-[0.28em] text-cyan-200/75 uppercase">
                        {t('landing.covidOrigin.kicker')}
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold tracking-normal text-white sm:text-5xl">
                        {t('landing.covidOrigin.heading')}
                    </h2>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-cyan-50/72">
                        {t('landing.covidOrigin.intro')}
                    </p>
                </div>

                <article
                    data-clubhouse-reveal
                    className="relative mt-14 overflow-hidden rounded-lg border-x border-y-[0.5px] border-cyan-100/14 bg-slate-950/68 p-6 shadow-2xl shadow-black/35 backdrop-blur-md sm:p-8"
                >
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(34,211,238,0.14),transparent_42%),radial-gradient(circle_at_26%_74%,rgba(168,85,247,0.08),transparent_38%)]"
                    />
                    <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.618fr)] lg:items-start">
                        <div>
                            <div className="space-y-4 text-sm leading-7 text-cyan-50/74 sm:text-base sm:leading-8">
                                <p>
                                    {t('landing.covidOrigin.story.paragraph1')}
                                </p>
                                <p>
                                    <GlowPhrase
                                        text={t(
                                            'landing.covidOrigin.story.paragraph2',
                                        )}
                                        phrase={t(
                                            'landing.covidOrigin.story.kicker',
                                        )}
                                    />
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="relative">
                                <p className="text-xs font-semibold tracking-[0.22em] text-cyan-200/80 uppercase">
                                    {t('landing.covidOrigin.story.kicker')}
                                </p>
                                <h3 className="relative mt-7 max-w-[20rem] text-xl leading-tight font-semibold tracking-normal text-white italic sm:text-2xl">
                                    <span
                                        aria-hidden="true"
                                        className="pointer-events-none absolute top-0 left-0 -translate-x-[22%] -translate-y-[26%] font-serif text-7xl leading-none font-bold text-cyan-100/10 not-italic sm:text-8xl"
                                    >
                                        {'“'}
                                    </span>
                                    <span>
                                        {t('landing.covidOrigin.story.heading')}
                                    </span>
                                </h3>
                            </div>
                        </div>
                    </div>
                </article>

                <div data-clubhouse-gallery className="relative mt-6">
                    <div
                        aria-hidden="true"
                        className="absolute -inset-x-4 top-1/2 h-px bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent"
                    />
                    <div className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <RoomTitle
                            title={galleryItems[0].title}
                            label={t(
                                'landing.covidOrigin.visual.placeholderLabel',
                            )}
                            item={galleryItems[0]}
                            onClick={() => setActiveGalleryIndex(0)}
                        />
                        <RoomTitle
                            title={t('landing.covidOrigin.rooms.mars')}
                            label={t('landing.covidOrigin.visual.roomLabel')}
                            item={galleryItems[1]}
                            onClick={() => setActiveGalleryIndex(1)}
                        />
                        <RoomTitle
                            title={t('landing.covidOrigin.rooms.jamesWebb')}
                            label={t('landing.covidOrigin.visual.roomLabel')}
                            item={galleryItems[2]}
                            onClick={() => setActiveGalleryIndex(2)}
                        />
                        <RoomTitle
                            title={t(
                                'landing.covidOrigin.rooms.generationShip',
                            )}
                            label={t('landing.covidOrigin.visual.roomLabel')}
                            item={galleryItems[3]}
                            onClick={() => setActiveGalleryIndex(3)}
                        />
                    </div>
                </div>

                <div className="relative mt-6 overflow-hidden rounded-lg border border-cyan-100/16 bg-slate-950/62 p-6 shadow-2xl shadow-black/30 backdrop-blur-md sm:p-8">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,0.16),transparent_32%),radial-gradient(circle_at_86%_34%,rgba(168,85,247,0.12),transparent_34%)]"
                    />
                    <div className="relative grid gap-6 lg:grid-cols-[minmax(0,0.618fr)_minmax(0,1fr)] lg:items-start">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.22em] text-cyan-200/80 uppercase">
                                {t('landing.covidOrigin.capstone.kicker')}
                            </p>
                            <h3 className="relative mt-7 text-xl leading-tight font-semibold tracking-normal text-white italic sm:text-2xl">
                                <span
                                    aria-hidden="true"
                                    className="pointer-events-none absolute top-0 left-0 -translate-x-[22%] -translate-y-[26%] font-serif text-7xl leading-none font-bold text-cyan-100/10 not-italic sm:text-8xl"
                                >
                                    {'“'}
                                </span>
                                <span>
                                    {t('landing.covidOrigin.capstone.heading')}
                                </span>
                            </h3>
                        </div>
                        <div className="space-y-4 text-sm leading-7 text-cyan-50/76 sm:text-base sm:leading-8">
                            <p>
                                {t('landing.covidOrigin.capstone.paragraph1')}
                            </p>
                            <p>
                                <GlowPhrase
                                    text={t(
                                        'landing.covidOrigin.capstone.paragraph2',
                                    )}
                                    phrase={t(
                                        'landing.covidOrigin.capstone.brilliantName',
                                    )}
                                />
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {activeGalleryItem && (
                <GalleryModal
                    item={activeGalleryItem}
                    position={t('landing.covidOrigin.gallery.position', {
                        current: (activeGalleryIndex ?? 0) + 1,
                        total: galleryItems.length,
                    })}
                    closeLabel={t('landing.covidOrigin.gallery.close')}
                    previousLabel={t('landing.covidOrigin.gallery.previous')}
                    nextLabel={t('landing.covidOrigin.gallery.next')}
                    archiveNotice={{
                        title: t(
                            'landing.covidOrigin.gallery.archiveNotice.title',
                        ),
                        body: t(
                            'landing.covidOrigin.gallery.archiveNotice.body',
                        ),
                        cancel: t(
                            'landing.covidOrigin.gallery.archiveNotice.cancel',
                        ),
                        accept: t(
                            'landing.covidOrigin.gallery.archiveNotice.accept',
                        ),
                    }}
                    onClose={() => setActiveGalleryIndex(null)}
                    onPrevious={showPreviousImage}
                    onNext={showNextImage}
                />
            )}
        </section>
    );
}

interface GalleryItem {
    src: string;
    title: string;
    caption: string;
    alt: string;
    linkHref?: string;
    linkLabel?: string;
}

interface GalleryButtonProps {
    className?: string;
    item: GalleryItem;
    onClick: () => void;
    variant?: 'featured' | 'card';
}

function GalleryButton({
    className = '',
    item,
    onClick,
    variant = 'card',
}: GalleryButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`${className} block w-full cursor-pointer overflow-hidden rounded border border-cyan-100/18 bg-slate-950/70 text-start transition hover:border-cyan-200/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300`}
        >
            <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                className={
                    variant === 'featured'
                        ? 'aspect-video w-full rounded object-cover object-left-top'
                        : 'aspect-[4/3] w-full object-cover object-top opacity-86 saturate-110'
                }
            />
        </button>
    );
}

function GalleryModal({
    archiveNotice,
    closeLabel,
    item,
    nextLabel,
    onClose,
    onNext,
    onPrevious,
    position,
    previousLabel,
}: {
    archiveNotice: {
        title: string;
        body: string;
        cancel: string;
        accept: string;
    };
    closeLabel: string;
    item: GalleryItem;
    nextLabel: string;
    onClose: () => void;
    onNext: () => void;
    onPrevious: () => void;
    position: string;
    previousLabel: string;
}) {
    const [isArchiveNoticeOpen, setIsArchiveNoticeOpen] = useState(false);
    const openArchive = () => {
        if (!item.linkHref) {
            return;
        }

        window.open(item.linkHref, '_blank', 'noopener,noreferrer');
        setIsArchiveNoticeOpen(false);
    };

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={item.title}
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
                        src={item.src}
                        alt={item.alt}
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
                        {item.title}
                    </h3>
                    <p className="mt-4 text-sm leading-7">{item.caption}</p>
                    {item.linkHref && item.linkLabel && (
                        <button
                            type="button"
                            onClick={() => setIsArchiveNoticeOpen(true)}
                            className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded border border-cyan-100/12 bg-cyan-50/5 px-3 py-2 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-50/12 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                        >
                            {item.linkLabel}
                            <i
                                aria-hidden="true"
                                className="fa-solid fa-arrow-up-right-from-square text-xs"
                            />
                        </button>
                    )}
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

                {isArchiveNoticeOpen && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/72 p-4 backdrop-blur-sm">
                        <button
                            type="button"
                            aria-label={archiveNotice.cancel}
                            onClick={() => setIsArchiveNoticeOpen(false)}
                            className="absolute inset-0 cursor-default"
                        />
                        <div className="relative w-full max-w-sm rounded-lg border border-cyan-100/18 bg-[#07101d] p-5 text-cyan-50 shadow-2xl shadow-black/50">
                            <h4 className="text-lg font-semibold text-white">
                                {archiveNotice.title}
                            </h4>
                            <p className="mt-3 text-sm leading-6 text-cyan-50/74">
                                {archiveNotice.body}
                            </p>
                            <div className="mt-5 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsArchiveNoticeOpen(false)
                                    }
                                    className="cursor-pointer rounded border border-cyan-100/12 bg-cyan-50/5 px-3 py-2 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-50/12 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                >
                                    {archiveNotice.cancel}
                                </button>
                                <button
                                    type="button"
                                    onClick={openArchive}
                                    className="cursor-pointer rounded border border-cyan-200/35 bg-cyan-200/16 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-200/24 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                                >
                                    {archiveNotice.accept}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function RoomTitle({
    item,
    label,
    onClick,
    title,
}: {
    item: GalleryItem;
    label: string;
    onClick: () => void;
    title: string;
}) {
    return (
        <div
            data-clubhouse-card
            className="overflow-hidden rounded-lg border border-cyan-100/14 bg-slate-950/58 shadow-xl shadow-black/20 backdrop-blur-md"
        >
            <GalleryButton item={item} onClick={onClick} />
            <div className="p-4">
                <p className="text-xs font-semibold tracking-[0.2em] text-cyan-200/70 uppercase">
                    {label}
                </p>
                <p className="mt-3 text-sm leading-6 font-semibold text-white">
                    {title}
                </p>
            </div>
        </div>
    );
}
