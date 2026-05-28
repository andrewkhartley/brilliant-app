import { usePage } from '@inertiajs/react';

import type { NestedTranslations } from '@/types/inertia';

/**
 * React hook exposing translation utilities backed by Inertia shared props.
 *
 * Reads `translations`, `locale`, and `dir` from `usePage().props` — these are
 * set by HandleInertiaRequests (locale, dir) and per-controller via the
 * translations() PHP helper (translations bundle).
 *
 * Forward-only design: no setLocale, no runtime locale switching. v1 is
 * English-only; locale comes from the server's app.getLocale().
 *
 * No JS i18n library dependency — Laravel lang files are the single source
 * of truth, delivered via Inertia, consumed here.
 */
export function useTranslation() {
    const { translations, locale, dir } = usePage().props;

    /**
     * Look up a dot-pathed translation key and optionally interpolate
     * `:placeholder` values. Returns the key itself as a fallback when
     * lookup fails — that surfaces missing-key bugs visibly in the UI
     * rather than silently rendering empty strings.
     */
    function t(
        key: string,
        replacements: Record<string, string | number> = {},
    ): string {
        const value = resolveKey(translations, key);

        if (typeof value !== 'string') {
            return key;
        }

        return interpolate(value, replacements);
    }

    /**
     * Laravel-style pluralization: keys with pipe-separated forms
     * ('one|other' or '{0} zero|{1} one|[2,*] other') select based on n.
     * `:count` is auto-added to replacements. Falls back to t() behavior
     * when the value isn't a pluralizable string.
     */
    function tChoice(
        key: string,
        n: number,
        replacements: Record<string, string | number> = {},
    ): string {
        const value = resolveKey(translations, key);

        if (typeof value !== 'string') {
            return key;
        }

        const form = pickPluralForm(value, n);

        return interpolate(form, { count: n, ...replacements });
    }

    return { t, tChoice, locale, dir };
}

function resolveKey(
    tree: Record<string, NestedTranslations>,
    key: string,
): NestedTranslations | undefined {
    let node: NestedTranslations | undefined = tree;

    for (const segment of key.split('.')) {
        if (typeof node !== 'object' || node === null) {
            return undefined;
        }

        node = node[segment];
    }

    return node;
}

function interpolate(
    str: string,
    replacements: Record<string, string | number>,
): string {
    return Object.entries(replacements).reduce(
        (acc, [key, value]) => acc.replaceAll(`:${key}`, String(value)),
        str,
    );
}

/**
 * Laravel pluralization syntax: pipe-separated forms.
 * Simple: 'singular|plural' (n==1 → singular; else plural)
 * Ranged: '{0} no items|{1} one item|[2,*] :count items'
 *
 * For v1, support the simple form ('a|b') and the bracketed-range form.
 * Ignores curly-brace literal-match form for now (YAGNI; can extend later).
 */
function pickPluralForm(value: string, n: number): string {
    const forms = value.split('|');

    if (forms.length === 1) {
        return forms[0];
    }

    // Try bracketed-range syntax: [min,max] form or {n} literal form
    for (const form of forms) {
        const rangeMatch = form.match(/^\[(\d+),(\d+|\*)\]\s*(.*)$/);

        if (rangeMatch) {
            const min = Number(rangeMatch[1]);
            const max =
                rangeMatch[2] === '*' ? Infinity : Number(rangeMatch[2]);

            if (n >= min && n <= max) {
                return rangeMatch[3];
            }
        }

        const literalMatch = form.match(/^\{(\d+)\}\s*(.*)$/);

        if (literalMatch && Number(literalMatch[1]) === n) {
            return literalMatch[2];
        }
    }

    // Fall back to simple binary: forms[0] for n==1, forms[1] for everything else
    return n === 1 ? forms[0] : (forms[1] ?? forms[0]);
}
