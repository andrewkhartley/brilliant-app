import { Link } from '@inertiajs/react';

interface ExperienceCardProps {
    href: string;
    title: string;
    description: string;
    imageSrc?: string;
    imageAlt?: string;
}

/**
 * Reusable card for linking to a playground experience or landing
 * "what else" entry. The entire card is the click target — wrap the
 * whole layout in Inertia <Link> so focus, click, and Enter all reach
 * the destination via one semantic interactive element rather than a
 * tiny title-only hit area.
 *
 * Composition:
 * - Presentational only. Consuming pages own the text and pass
 *   already-translated `title` and `description` strings via props.
 *   The card itself stays i18n-agnostic so it can be dropped into any
 *   namespace context (playground.hub.*, landing.whatElse.*, etc.)
 *   without adding translation-key plumbing here.
 * - The card owns the layout, hover/focus chrome, and the <Link>
 *   wrapper; consumers own the words and the destination.
 *
 * Accessibility:
 * - <Link> wraps the entire card so focus + click + Enter all reach
 *   the destination via a single, semantic interactive element.
 * - <h3> for the title preserves heading hierarchy: the card lives
 *   inside Phase 9's playground hub <h1> and Phase 7's landing <h1>,
 *   so h3 nests cleanly under either page-level h2 section header.
 * - Image alt text is consumer-supplied. If imageSrc is decorative,
 *   pass imageAlt="" (the convention also used by multi-plane Scene
 *   layers in Phase 5).
 *
 * Visual:
 * - hover:shadow-md gives subtle elevation feedback so mouse users
 *   see the card is interactive.
 * - focus-visible:shadow-md mirrors the hover state for keyboard
 *   users; the AppLayout focus-visible outline ring also applies
 *   automatically to the underlying <a> via inheritance.
 * - Logical Tailwind classes only (no ml-/mr-/pl-/pr-/left-/right-)
 *   so the card flips correctly under RTL without per-locale tweaks.
 *
 * Used by:
 * - Phase 7 (Landing) — "what else" section pointing to /playground/*
 * - Phase 9 (Playground hub) — the 3-card grid
 */
export function ExperienceCard({
    href,
    title,
    description,
    imageSrc,
    imageAlt = '',
}: ExperienceCardProps) {
    return (
        <Link
            href={href}
            className="group block h-full overflow-hidden rounded-lg border border-cyan-100/16 bg-slate-950/76 shadow-2xl shadow-black/35 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-cyan-200/42 hover:bg-slate-950/86 hover:shadow-cyan-950/40 focus-visible:border-cyan-200/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
        >
            {imageSrc && (
                <div className="relative aspect-[16/7] overflow-hidden border-b border-cyan-100/12 bg-cyan-950/20">
                    <img
                        src={imageSrc}
                        alt={imageAlt}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover opacity-80 saturate-125 transition duration-500 group-hover:scale-105 group-hover:opacity-95"
                    />
                    <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/26 to-transparent"
                    />
                </div>
            )}
            <div className="relative p-6">
                <div
                    aria-hidden="true"
                    className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/40 to-transparent"
                />
                <h3 className="flex items-center gap-3 text-lg font-semibold text-white">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded bg-cyan-50/10 text-cyan-200 ring-1 ring-cyan-200/35 transition duration-300 group-hover:bg-cyan-200/18 group-hover:text-white">
                        <i
                            aria-hidden="true"
                            className="fa-solid fa-arrow-right text-sm transition-transform duration-300 group-hover:translate-x-0.5"
                        />
                    </span>
                    {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-cyan-100/78">
                    {description}
                </p>
                <div
                    aria-hidden="true"
                    className="mt-5 h-px w-16 bg-cyan-200/28 transition-all duration-300 group-hover:w-24 group-hover:bg-cyan-200/55"
                />
            </div>
        </Link>
    );
}
