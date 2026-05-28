/**
 * Module augmentation extending Inertia's PageProps with the shared
 * data the HandleInertiaRequests middleware (and per-controller calls)
 * inject into every page.
 *
 * - `locale`: BCP47 string from app()->getLocale() (always 'en' in v1)
 * - `dir`: 'ltr' or 'rtl' from the locale_dir() helper
 * - `translations`: per-page namespace bundle. The page's controller
 *    decides which namespaces to include via translations(['ns']).
 *    Universal namespaces (nav, common, errors) are always present.
 * - `name`, `auth`: pre-existing shared data (starter kit)
 */

import '@inertiajs/core';

declare module '@inertiajs/core' {
    interface PageProps {
        locale: string;
        dir: 'ltr' | 'rtl';
        translations: Record<string, NestedTranslations>;
        name: string;
        auth: {
            user: { id: number; name: string; email: string } | null;
        };
    }
}

/**
 * Recursive type for nested translation values. A translation entry is
 * either a leaf string or a sub-namespace (recursive map).
 */
export type NestedTranslations = string | { [key: string]: NestedTranslations };
