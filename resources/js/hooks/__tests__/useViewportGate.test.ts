/** @vitest-environment jsdom */
import { act, renderHook } from '@testing-library/react';
import type { RefObject } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { useViewportGate } from '../useViewportGate';

/**
 * Captures the IO callback so tests can simulate viewport entry/exit
 * without a real browser environment.
 */
function setupMockIntersectionObserver() {
    let capturedCallback: IntersectionObserverCallback | null = null;
    const observe = vi.fn();
    const disconnect = vi.fn();

    // Must be a class (not an arrow vi.fn) so `new IntersectionObserver(...)` works.
    // Vitest 4 + ES strict mode: arrow functions are not constructable.
    class MockObserver {
        observe = observe;
        disconnect = disconnect;
        unobserve = vi.fn();
        takeRecords = vi.fn(() => []);

        constructor(callback: IntersectionObserverCallback) {
            capturedCallback = callback;
        }
    }

    globalThis.IntersectionObserver =
        MockObserver as unknown as typeof IntersectionObserver;

    return {
        observe,
        disconnect,
        triggerIntersect: (isIntersecting: boolean) => {
            if (!capturedCallback) {
                throw new Error('IntersectionObserver was never instantiated');
            }

            const entry = { isIntersecting } as IntersectionObserverEntry;

            capturedCallback([entry], {} as IntersectionObserver);
        },
    };
}

function makeRef(): RefObject<Element | null> {
    const element = document.createElement('div');

    return { current: element };
}

describe('useViewportGate', () => {
    test('returns false (paused) initially', () => {
        setupMockIntersectionObserver();
        const ref = makeRef();
        const { result } = renderHook(() => useViewportGate(ref));

        expect(result.current).toBe(false);
    });

    test('returns true when IO entry fires with isIntersecting=true', () => {
        const { triggerIntersect } = setupMockIntersectionObserver();
        const ref = makeRef();
        const { result } = renderHook(() => useViewportGate(ref));

        act(() => {
            triggerIntersect(true);
        });

        expect(result.current).toBe(true);
    });

    test('returns to false when IO exit fires with isIntersecting=false', () => {
        const { triggerIntersect } = setupMockIntersectionObserver();
        const ref = makeRef();
        const { result } = renderHook(() => useViewportGate(ref));

        act(() => triggerIntersect(true));
        expect(result.current).toBe(true);

        act(() => triggerIntersect(false));
        expect(result.current).toBe(false);
    });

    test('observes the ref element on mount', () => {
        const { observe } = setupMockIntersectionObserver();
        const ref = makeRef();

        renderHook(() => useViewportGate(ref));

        expect(observe).toHaveBeenCalledWith(ref.current);
    });

    test('disconnects on unmount', () => {
        const { disconnect } = setupMockIntersectionObserver();
        const ref = makeRef();
        const { unmount } = renderHook(() => useViewportGate(ref));

        unmount();

        expect(disconnect).toHaveBeenCalled();
    });
});
