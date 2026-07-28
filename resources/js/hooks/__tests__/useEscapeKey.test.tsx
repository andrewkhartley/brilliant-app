/** @vitest-environment jsdom */
import { fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { useEscapeKey } from '../useEscapeKey';

interface HarnessProps {
    isActive: boolean;
    onEscape: () => void;
}

function Harness({ isActive, onEscape }: HarnessProps) {
    useEscapeKey(isActive, onEscape);

    return null;
}

const pressEscape = () => fireEvent.keyDown(window, { key: 'Escape' });

afterEach(() => vi.restoreAllMocks());

describe('useEscapeKey', () => {
    test('calls back when Escape is pressed while active', () => {
        const onEscape = vi.fn();
        render(<Harness isActive onEscape={onEscape} />);

        pressEscape();

        expect(onEscape).toHaveBeenCalledTimes(1);
    });

    test('binds nothing while inactive', () => {
        const onEscape = vi.fn();
        render(<Harness isActive={false} onEscape={onEscape} />);

        pressEscape();

        expect(onEscape).not.toHaveBeenCalled();
    });

    test('ignores other keys', () => {
        const onEscape = vi.fn();
        render(<Harness isActive onEscape={onEscape} />);

        fireEvent.keyDown(window, { key: 'Enter' });
        fireEvent.keyDown(window, { key: 'ArrowRight' });

        expect(onEscape).not.toHaveBeenCalled();
    });

    test('unbinds when it goes inactive', () => {
        const onEscape = vi.fn();
        const { rerender } = render(<Harness isActive onEscape={onEscape} />);

        rerender(<Harness isActive={false} onEscape={onEscape} />);
        pressEscape();

        expect(onEscape).not.toHaveBeenCalled();
    });

    test('unbinds on unmount', () => {
        const onEscape = vi.fn();
        const { unmount } = render(<Harness isActive onEscape={onEscape} />);

        unmount();
        pressEscape();

        expect(onEscape).not.toHaveBeenCalled();
    });

    // The callback lives in a ref precisely so callers can pass inline
    // arrows without resubscribing. That must not come at the cost of
    // firing a stale closure.
    test('calls the latest callback, not the one from first render', () => {
        const first = vi.fn();
        const second = vi.fn();
        const { rerender } = render(<Harness isActive onEscape={first} />);

        rerender(<Harness isActive onEscape={second} />);
        pressEscape();

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });

    test('does not rebind the listener when only the callback changes', () => {
        const addSpy = vi.spyOn(window, 'addEventListener');
        const { rerender } = render(<Harness isActive onEscape={vi.fn()} />);

        const afterMount = addSpy.mock.calls.filter(
            ([type]) => type === 'keydown',
        ).length;
        rerender(<Harness isActive onEscape={vi.fn()} />);

        const afterRerender = addSpy.mock.calls.filter(
            ([type]) => type === 'keydown',
        ).length;

        expect(afterRerender).toBe(afterMount);
    });
});
