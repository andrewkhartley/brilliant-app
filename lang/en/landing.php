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
        'title' => 'Take the math, and make it move.',
        'subtitle' => 'Andrew Hartley',
        'pitch' => 'A Brilliant.org application built as the application itself — interactive math, multi-plane camera, every line of source visible.',
        'layers' => [
            'sky' => 'JWST sky placeholder',
            'distantNebula' => 'Distant nebula placeholder',
            'nearNebula' => 'Near nebula veil placeholder',
            'horizon' => 'Horizon band placeholder',
            'rail' => 'Observation deck rail placeholder',
        ],
        'caption' => [
            'subtitle' => 'A Brilliant.org application built as the application itself.',
        ],
    ],

    'covidOrigin' => [
        'heading' => 'The Covid origin',
        'intro' => 'It\'s March 2020. The Zoom invite has 47 people on it.',
        'layers' => [
            'lectureHall' => 'Darkened lecture hall placeholder',
            'seats' => 'Zoom panel grid placeholder',
            'slideDeck' => 'Glowing slide deck placeholder',
        ],
        'caption' => [
            'opening' => 'It\'s March 2020. The Zoom invite has 47 people on it.',
            'midReveal' => 'And every face is asking the same question through different eyes.',
            'close' => 'That talk became a pattern: explain it, then let them touch it.',
        ],
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
