<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ locale_dir() }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        @php
            $shareTitle = 'Andrew Hartley :.: Brilliant Application';
            $shareDescription = 'An interactive cover letter for Brilliant: story-driven learning experiences, physics playgrounds, and the engineering behind them.';
            $shareImage = url('/assets/meta/brilliant-application-card.png');
        @endphp

        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="description" content="{{ $shareDescription }}">
        <meta name="theme-color" content="#08111f">
        <meta name="color-scheme" content="dark light">

        <meta property="og:type" content="website">
        <meta property="og:site_name" content="{{ $shareTitle }}">
        <meta property="og:title" content="{{ $shareTitle }}">
        <meta property="og:description" content="{{ $shareDescription }}">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:image" content="{{ $shareImage }}">
        <meta property="og:image:secure_url" content="{{ $shareImage }}">
        <meta property="og:image:type" content="image/png">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="Andrew Hartley Brilliant Application preview card">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $shareTitle }}">
        <meta name="twitter:description" content="{{ $shareDescription }}">
        <meta name="twitter:image" content="{{ $shareImage }}">
        <meta name="twitter:image:alt" content="Andrew Hartley Brilliant Application preview card">

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        <link rel="manifest" href="/site.webmanifest">

        @fonts

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
            <title inertia>{{ $shareTitle }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
