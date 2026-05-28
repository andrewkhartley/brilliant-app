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
            className="block overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:shadow-md"
        >
            {imageSrc && (
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    loading="lazy"
                    decoding="async"
                    className="block aspect-video w-full object-cover"
                />
            )}
            <div className="p-6">
                <h3 className="text-lg font-semibold text-neutral-900">
                    {title}
                </h3>
                <p className="mt-2 text-sm text-neutral-700">{description}</p>
            </div>
        </Link>
    );
}
