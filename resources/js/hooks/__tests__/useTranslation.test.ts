import { usePage } from '@inertiajs/react';
import { describe, expect, test, vi } from 'vitest';

import { useTranslation } from '../useTranslation';

// Mock @inertiajs/react's usePage() with a configurable page payload.
// vi.mock() is hoisted by Vitest above the import statements at runtime, so
// the import on line 1 receives the mocked module.
vi.mock('@inertiajs/react', () => ({
    usePage: vi.fn(),
}));

function setupPage(props: object) {
    (usePage as ReturnType<typeof vi.fn>).mockReturnValue({ props });
}

describe('useTranslation t()', () => {
    test('resolves a simple key', () => {
        setupPage({
            locale: 'en',
            dir: 'ltr',
            translations: { nav: { home: 'Home' } },
        });
        const { t } = useTranslation();
        expect(t('nav.home')).toBe('Home');
    });

    test('resolves a deeply nested key', () => {
        setupPage({
            locale: 'en',
            dir: 'ltr',
            translations: { errors: { horizons: { timeout: 'Try again.' } } },
        });
        const { t } = useTranslation();
        expect(t('errors.horizons.timeout')).toBe('Try again.');
    });

    test('returns key itself when missing (surfacing bugs visibly)', () => {
        setupPage({ locale: 'en', dir: 'ltr', translations: {} });
        const { t } = useTranslation();
        expect(t('nav.missing')).toBe('nav.missing');
    });

    test('interpolates :placeholder values', () => {
        setupPage({
            locale: 'en',
            dir: 'ltr',
            translations: { greeting: { hello: 'Hello, :name!' } },
        });
        const { t } = useTranslation();
        expect(t('greeting.hello', { name: 'Andrew' })).toBe('Hello, Andrew!');
    });

    test('interpolates numeric replacements via String()', () => {
        setupPage({
            locale: 'en',
            dir: 'ltr',
            translations: { cart: { items: 'You have :n items' } },
        });
        const { t } = useTranslation();
        expect(t('cart.items', { n: 5 })).toBe('You have 5 items');
    });
});

describe('useTranslation tChoice()', () => {
    test('simple binary: singular for n=1', () => {
        setupPage({
            locale: 'en',
            dir: 'ltr',
            translations: { items: { count: 'item|items' } },
        });
        const { tChoice } = useTranslation();
        expect(tChoice('items.count', 1)).toBe('item');
    });

    test('simple binary: plural for n>1', () => {
        setupPage({
            locale: 'en',
            dir: 'ltr',
            translations: { items: { count: 'item|items' } },
        });
        const { tChoice } = useTranslation();
        expect(tChoice('items.count', 5)).toBe('items');
    });

    test('bracketed range: [0,0] for n=0', () => {
        setupPage({
            locale: 'en',
            dir: 'ltr',
            translations: {
                items: {
                    count: '[0,0] no items|[1,1] one item|[2,*] :count items',
                },
            },
        });
        const { tChoice } = useTranslation();
        expect(tChoice('items.count', 0)).toBe('no items');
    });

    test('bracketed range: [2,*] auto-interpolates :count', () => {
        setupPage({
            locale: 'en',
            dir: 'ltr',
            translations: {
                items: {
                    count: '[0,0] no items|[1,1] one item|[2,*] :count items',
                },
            },
        });
        const { tChoice } = useTranslation();
        expect(tChoice('items.count', 42)).toBe('42 items');
    });
});

describe('useTranslation locale + dir pass-through', () => {
    test('exposes locale from page props', () => {
        setupPage({ locale: 'fr', dir: 'ltr', translations: {} });
        const { locale } = useTranslation();
        expect(locale).toBe('fr');
    });

    test('exposes dir from page props', () => {
        setupPage({ locale: 'ar', dir: 'rtl', translations: {} });
        const { dir } = useTranslation();
        expect(dir).toBe('rtl');
    });
});
