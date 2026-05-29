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
        'heading' => 'Why interactive',
        'feelTheMath' => 'Brilliant calls it "feel the math." A problem isn\'t something you read about — it\'s something you can pull on, push back from, watch respond. That direct sense of cause and effect is the difference between knowing-about and knowing.',
        'multiPlaneCamera' => 'Disney called it the multi-plane camera, 1937. Layers of glass at different depths, photographed through a vertical column. When the camera moved, parallax did the rest — depth and atmosphere emerging from flat paint.',
        'synthesis' => 'Both inventions answer the same question: how do you make an idea feel like a place? This site is one application of that question to math, animation, and engineering — built as the cover letter for a Brilliant role.',
    ],

    'tryOne' => [
        'heading' => 'Try one yourself',
        'intro' => 'The full Interstellar travel agency lives at /playground/interstellar. Here\'s a taste — drag the slider to set a constant proper acceleration sustained for one year of coordinate time, and watch the relativistic speed approach the speed of light.',
        'sliderLabel' => 'Acceleration',
        'resultLabel' => 'Peak velocity:',
        'fullLink' => 'Open the full Interstellar experience →',
    ],

    'whatElse' => [
        'heading' => 'What else I built',
        'intro' => 'Two more experiences in the playground — built on the same engine and equation registry.',
        'cards' => [
            'cruise' => [
                'title' => 'Cruise',
                'description' => 'Planet-hopping trip builder with live NASA Horizons data. Pick destinations, pick a profile, get the relativistic itinerary.',
            ],
            'habitat' => [
                'title' => 'Habitat',
                'description' => 'O\'Neill Cylinder interior with the multi-plane camera as a shadowbox window. Interactive sliders for radius, length → 1g spin rate, surface area, population at given density.',
            ],
        ],
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
