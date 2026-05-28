<?php

/*
 * Landing page translations — populated incrementally across Phase 7.
 *
 * Per-task subnamespaces:
 * - hero (P7.T2) — title + tagline + multi-plane scene labels + captions
 * - covidOrigin (P7.T3) — opening prose + multi-plane scene labels + captions
 * - whyInteractive (P7.T4) — philosophy prose (3 paragraphs)
 * - tryOne (P7.T5) — inline Interstellar demo copy
 * - whatElse (P7.T6) — ExperienceCard text for Cruise + Habitat
 * - closingScene (P7.T7) — final multi-plane scene labels + captions
 * - contactFooter (P7.T8) — page-specific CTA + contact links
 *
 * P7.T1 (this scaffold) seeds each subnamespace with placeholderTitle +
 * placeholderNote keys; subsequent tasks replace those with real section
 * content.
 */

return [
    'pageTitle' => 'Andrew Hartley — Brilliant application',
    'pageDescription' => 'Multi-plane scenes + interactive equations + the craft behind the application.',

    'hero' => [
        'placeholderTitle' => 'Hero',
        'placeholderNote' => 'Coming in P7.T2 — title card + multi-plane scene (cosmic foreground + nebula + JWST sky, camera tracks forward through observation deck rail).',
    ],

    'covidOrigin' => [
        'placeholderTitle' => 'CovidOrigin',
        'placeholderNote' => 'Coming in P7.T3 — March 2020 lecture hall scrollytelling, multi-plane dollies toward glowing slide deck.',
    ],

    'whyInteractive' => [
        'placeholderTitle' => 'WhyInteractive',
        'placeholderNote' => 'Coming in P7.T4 — philosophy prose. Brilliant\'s "feel the math" + Disney\'s multi-plane camera as compass points. No scene; intentional rest after two scrolly sections.',
    ],

    'tryOne' => [
        'placeholderTitle' => 'TryOne',
        'placeholderNote' => 'Coming in P7.T5 — inline Interstellar relativity demo. EquationCard + SliderInput + LiveResult around relativisticSpeed.',
    ],

    'whatElse' => [
        'placeholderTitle' => 'WhatElse',
        'placeholderNote' => 'Coming in P7.T6 — ExperienceCard grid pointing to /playground/cruise and /playground/habitat.',
    ],

    'closingScene' => [
        'placeholderTitle' => 'ClosingScene',
        'placeholderNote' => 'Coming in P7.T7 — final multi-plane scene. Dawn inside an O\'Neill Cylinder, the sun-line catching the curved horizon.',
    ],

    'contactFooter' => [
        'placeholderTitle' => 'ContactFooter',
        'placeholderNote' => 'Coming in P7.T8 — page-specific CTA close above AppLayout\'s chrome Footer. Email + GitHub + LinkedIn + CV links.',
    ],
];
