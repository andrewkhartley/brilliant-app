<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ locale_dir() }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

        @fonts
        <script>
            window.FontAwesomeConfig = {
                autoReplaceSvg: false,
            };
        </script>
        <script src="https://kit.fontawesome.com/f22762bc1a.js" crossorigin="anonymous"></script>

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        {{-- Inertia-managed title: the `inertia` attribute marks this element as
             owned by Inertia's head manager, so client-side <Head title="..."/>
             replaces the text in place rather than removing-and-recreating the
             element. Without `inertia`, axe-core (loaded in dev via app.tsx)
             reports "Missing required 'title' element" during the brief gap
             between Blade's title being removed and React's replacement being
             inserted. The Blade-side text serves as the SSR/no-JS fallback. --}}
        <x-inertia::head>
            <title inertia>{{ config('app.name', 'Laravel') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
