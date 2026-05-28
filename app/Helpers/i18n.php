<?php

/*
 * i18n helpers — pan-app utilities for translation namespace bundling
 * and locale direction resolution.
 *
 * Registered in composer.json autoload.files (same mechanism as
 * app/Helpers/constants.php and app/Helpers/core.php from Phase 2).
 */

if (! function_exists('translations')) {
    /**
     * Returns a merged translations array for the requested namespaces, with
     * the three universal namespaces (nav, common, errors) always included.
     *
     * Usage in a controller:
     *
     *   return Inertia::render('Landing', [
     *       'translations' => translations(['landing']),
     *   ]);
     *
     * The hook on the React side reads usePage().props.translations and
     * exposes t('namespace.key') — the namespace becomes the first dot-segment.
     *
     * @param  array<string>  $extraNamespaces  Page-specific namespaces to include
     * @return array<string, array<string, mixed>>
     */
    function translations(array $extraNamespaces = []): array
    {
        $universal = ['nav', 'common', 'errors'];
        $all = array_unique([...$universal, ...$extraNamespaces]);

        return collect($all)
            ->mapWithKeys(fn (string $ns): array => [$ns => trans()->get($ns, [], app()->getLocale())])
            ->all();
    }
}

if (! function_exists('locale_dir')) {
    /**
     * Returns 'rtl' or 'ltr' for the given locale (defaults to the current app
     * locale). Used by the blade template's <html dir> attribute and by the
     * Inertia middleware's shared 'dir' prop.
     *
     * RTL locales: ar (Arabic), he (Hebrew), fa (Persian/Farsi), ur (Urdu),
     * yi (Yiddish). Everything else is 'ltr' — covers all v1 needs (English-only)
     * and is correct for any latin/CJK locale added later.
     */
    function locale_dir(?string $locale = null): string
    {
        $locale = $locale ?? app()->getLocale();
        $rtl = ['ar', 'he', 'fa', 'ur', 'yi'];

        return in_array($locale, $rtl, true) ? 'rtl' : 'ltr';
    }
}
