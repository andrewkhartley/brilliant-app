/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { ExperienceCard } from '../ExperienceCard';

// Mock @inertiajs/react's <Link> as a thin <a> shim so we exercise the real
// href + className + children wiring without booting the Inertia router.
// ExperienceCard has no useTranslation dependency — consumers pass already-
// translated strings as props — so usePage is not mocked here.
vi.mock('@inertiajs/react', () => ({
    Link: ({
        children,
        href,
        className,
    }: {
        children: ReactNode;
        href: string;
        className?: string;
    }) => (
        <a href={href} className={className}>
            {children}
        </a>
    ),
}));

describe('ExperienceCard', () => {
    afterEach(() => {
        cleanup();
    });

    test('renders title and description', () => {
        // Props-driven text is the consumer contract: whatever strings the
        // page passes in are what render. Proves the slots wire through.
        render(
            <ExperienceCard
                href="/x"
                title={'Test Title'}
                description={'Test description here.'}
            />,
        );

        expect(screen.queryByText('Test Title')).not.toBeNull();
        expect(screen.queryByText('Test description here.')).not.toBeNull();
    });

    test('wraps content in Inertia Link with correct href', () => {
        // Whole-card click target is the core composition decision: the
        // entire rectangle is the <Link>, so the title and description
        // must live inside that single <a>. If wrapping ever regresses to
        // a title-only link, this assertion catches it.
        const { container } = render(
            <ExperienceCard
                href="/playground/interstellar"
                title={'Interstellar'}
                description={'Travel near c.'}
            />,
        );
        const link = container.querySelector('a');

        expect(link?.getAttribute('href')).toBe('/playground/interstellar');
        expect(link?.textContent).toContain('Interstellar');
    });

    test('renders image with provided alt when imageSrc set', () => {
        // The image slot is optional, but when present the consumer-supplied
        // alt must reach the DOM exactly. Decorative usage passes alt="" by
        // convention (multi-plane Scene layer pattern).
        render(
            <ExperienceCard
                href="/x"
                title={'X'}
                description={'Y'}
                imageSrc="/assets/test.png"
                imageAlt="A test image"
            />,
        );
        const img = screen.queryByAltText('A test image');

        expect(img).not.toBeNull();
        expect(img?.getAttribute('src')).toBe('/assets/test.png');
    });

    test('omits img element when imageSrc not provided', () => {
        // No imageSrc → no <img> at all (not an empty <img> with broken src).
        // The 3-card debug demo relies on this — it renders text-only cards.
        const { container } = render(
            <ExperienceCard href="/x" title={'X'} description={'Y'} />,
        );

        expect(container.querySelector('img')).toBeNull();
    });

    test('uses logical Tailwind classes (no physical left/right)', () => {
        // RTL discipline: the card must use logical properties (ms-/me-/
        // ps-/pe-/start-/end-) so layout flips automatically under RTL.
        // A regression to ml-/mr-/pl-/pr-/left-/right- breaks Arabic + Hebrew.
        const { container } = render(
            <ExperienceCard
                href="/x"
                title={'X'}
                description={'Y'}
                imageSrc="/x.png"
                imageAlt="x"
            />,
        );

        expect(container.innerHTML).not.toMatch(/\b(ml|mr|pl|pr|left|right)-/);
    });
});
