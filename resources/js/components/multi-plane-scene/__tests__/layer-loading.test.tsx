/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Layer, MultiPlaneScene } from '..';

beforeEach(() => {
    // Must be a class, not vi.fn(arrow) — jsdom constructs this with `new`.
    class MockIntersectionObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() {
            return [];
        }
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
});

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('Layer loading hints', () => {
    test('defaults to lazy loading at automatic priority', () => {
        render(
            <MultiPlaneScene height="100vh">
                <Layer
                    src="/a.webp"
                    alt="below fold"
                    position="full"
                    depth={0.5}
                />
            </MultiPlaneScene>,
        );

        const image = screen.getByAltText('below fold');

        expect(image.getAttribute('loading')).toBe('lazy');
        expect(image.getAttribute('fetchpriority')).toBe('auto');
    });

    test('honors eager loading and high fetch priority when asked', () => {
        render(
            <MultiPlaneScene height="100vh">
                <Layer
                    src="/b.webp"
                    alt="above fold"
                    position="full"
                    depth={0.95}
                    loading="eager"
                    fetchPriority="high"
                />
            </MultiPlaneScene>,
        );

        const image = screen.getByAltText('above fold');

        expect(image.getAttribute('loading')).toBe('eager');
        expect(image.getAttribute('fetchpriority')).toBe('high');
    });

    test('always decodes asynchronously', () => {
        render(
            <MultiPlaneScene height="100vh">
                <Layer src="/c.webp" alt="any" position="full" depth={0.5} />
            </MultiPlaneScene>,
        );

        expect(screen.getByAltText('any').getAttribute('decoding')).toBe(
            'async',
        );
    });
});
