/** @vitest-environment jsdom */
import { renderHook } from '@testing-library/react';
import type {RefObject} from 'react';
import { describe, expect, test, vi } from 'vitest';

import { useScrollTrigger } from '../useScrollTrigger';

const mockScrollTriggerCreate = vi.fn();
const mockKill = vi.fn();
const mockRegisterPlugin = vi.fn();

vi.mock('gsap', () => ({
    default: { registerPlugin: mockRegisterPlugin },
}));

vi.mock('gsap/ScrollTrigger', () => ({
    default: {
        create: vi.fn(() => {
            mockScrollTriggerCreate();

            return { kill: mockKill, progress: 0 };
        }),
    },
}));

function makeTriggerRef(): RefObject<Element | null> {
    return { current: document.createElement('div') };
}

describe('useScrollTrigger', () => {
    test('does not create ScrollTrigger when enabled=false', async () => {
        mockScrollTriggerCreate.mockClear();
        const trigger = makeTriggerRef();
        renderHook(() =>
            useScrollTrigger({ enabled: false, vars: { trigger } }),
        );

        await vi.waitFor(() => {
            expect(mockScrollTriggerCreate).not.toHaveBeenCalled();
        });
    });

    test('creates ScrollTrigger when enabled=true', async () => {
        mockScrollTriggerCreate.mockClear();
        const trigger = makeTriggerRef();
        renderHook(() =>
            useScrollTrigger({ enabled: true, vars: { trigger } }),
        );

        await vi.waitFor(() => {
            expect(mockScrollTriggerCreate).toHaveBeenCalled();
        });
    });

    test('registers ScrollTrigger plugin before creating', async () => {
        mockRegisterPlugin.mockClear();
        const trigger = makeTriggerRef();
        renderHook(() =>
            useScrollTrigger({ enabled: true, vars: { trigger } }),
        );

        await vi.waitFor(() => {
            expect(mockRegisterPlugin).toHaveBeenCalled();
        });
    });

    test('kills ScrollTrigger on unmount', async () => {
        mockKill.mockClear();
        mockScrollTriggerCreate.mockClear();
        const trigger = makeTriggerRef();
        const { unmount } = renderHook(() =>
            useScrollTrigger({ enabled: true, vars: { trigger } }),
        );

        await vi.waitFor(() =>
            expect(mockScrollTriggerCreate).toHaveBeenCalled(),
        );
        unmount();

        expect(mockKill).toHaveBeenCalled();
    });
});
