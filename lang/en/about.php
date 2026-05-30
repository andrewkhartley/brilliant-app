<?php

/*
 * About page translations — populated in Phase 12.
 *
 * Per-section subnamespaces:
 * - intro (P12.T2) — h1 + opening line + photo alt + placeholder label
 * - disney (P12.T2) — craft lineage chapter (3 paragraphs)
 * - covid (P12.T2) — 2020 pivot story (3 paragraphs)
 * - whatIMake (P12.T2) — Undaunted moment + Clubhouse origin +
 *   transparency-attribution thread (4 paragraphs + 1 transparency note)
 * - whyBrilliant (P12.T2) — synthesis / why this application (3 paragraphs)
 * - contact (P12.T2) — email CTA + LinkedIn link
 *
 * P12.T1 (this scaffold) seeds each subnamespace with placeholderTitle +
 * placeholderNote keys; P12.T2 replaces those with real section content.
 */

return [
    'pageTitle' => 'About Andrew Hartley',
    'pageDescription' => 'The longer story — Disney chapter, Covid talks, Undaunted community, why Brilliant.',

    'intro' => [
        'placeholderTitle' => 'Intro',
        'placeholderNote' => 'Coming in P12.T2 — h1 + opening line + photo slot (Hero-style top).',
    ],

    'disney' => [
        'placeholderTitle' => 'Disney chapter',
        'placeholderNote' => 'Coming in P12.T2 — craft lineage from Andrew\'s Disney Cast Member background.',
    ],

    'covid' => [
        'placeholderTitle' => 'Covid talks',
        'placeholderNote' => 'Coming in P12.T2 — March 2020 pivot; the 47-person Zoom; the pattern.',
    ],

    'whatIMake' => [
        'placeholderTitle' => 'What I make',
        'placeholderNote' => 'Coming in P12.T2 — Undaunted; Clubhouse origin; megastructures-in-space curiosity; transparency-attribution thread for the physics powering Interstellar + Cruise.',
    ],

    'whyBrilliant' => [
        'placeholderTitle' => 'Why Brilliant',
        'placeholderNote' => 'Coming in P12.T2 — synthesis; why this application is built as itself; the trajectory.',
    ],

    'contact' => [
        'placeholderTitle' => 'Contact',
        'placeholderNote' => 'Coming in P12.T2 — email CTA + LinkedIn link.',
    ],
];
