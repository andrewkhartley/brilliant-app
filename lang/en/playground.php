<?php

/*
 * Playground hub strings — Phase 9 consumer.
 *
 * Per-page namespace: controllers rendering /playground must include
 * 'playground' in their translations() call.
 */

return [
    'hub' => [
        'title' => 'Playground',
        'intro' => 'Three interactive experiences exploring physics, space travel, and habitat design.',
        'cards' => [
            'interstellar' => [
                'title' => 'Interstellar',
                'description' => 'A relativity travel agency. Set acceleration, pick a destination, watch time dilation play out — Earth time, traveler time, fuel-equivalents, the equation itself.',
            ],
            'cruise' => [
                'title' => 'Cruise',
                'description' => 'A planet trip builder with live NASA Horizons data. Pick destinations, set a date, get an itinerary with orbital periods + transit times.',
            ],
            'habitat' => [
                'title' => 'Habitat',
                'description' => 'An O\'Neill Cylinder explored as a shadowbox window. Multi-plane camera moves through the cylinder interior with interactive cylinder math (radius, length, spin rate for 1g, surface area, population at density).',
            ],
        ],
    ],

    'sceneDebug' => [
        'title' => 'MultiPlaneScene prototype',
        'intro' => 'A plain-color test scene for the multi-plane camera idea. Scroll through the frame: near layers should move more, far layers should move less, and the top and bottom planes should feel like the window we look through.',
        'layers' => [
            'infinity' => 'Back wall / static',
            'cutawayFar' => 'Thin cutaway / depth 0.74',
            'cutawayMid' => 'Middle cutaway / depth 0.38',
            'cutawayNear' => 'Near cutaway / depth 0.08',
        ],
        'caption' => [
            'opening' => 'Each colored frame is a cutaway wall plane around an open fourth wall.',
            'midReveal' => 'The near frame should slide past fastest while the far frame barely moves.',
            'close' => 'This should read like looking into a room from outside the missing wall.',
        ],
        'reducedMotionNote' => 'If you have prefers-reduced-motion enabled, layers stay at their mid-scroll pose and captions remain fully visible.',
        'outro' => 'This prototype uses color blocks instead of artwork so the motion model can be judged on its own.',
    ],

    'componentsDebug' => [
        'title' => 'Phase 6 shared UI components — debug view',
        'intro' => 'Each shipped component is rendered here in isolation so its real-browser behavior can be verified. Sections grow as new components land; placeholders mark the components still in flight.',
        'chromeSection' => [
            'title' => 'Chrome — Nav + Footer',
            'note' => 'The sticky header at the top of this page is Nav.tsx; the centered footer at the bottom is Footer.tsx. Both are composed by AppLayout, so they appear on every page in the app. Verify: sticky behavior on scroll, two primary links, copyright + license text, GitHub + Email contact links.',
        ],
        'equationsSection' => [
            'title' => 'EquationCard',
            'intro' => 'KaTeX-rendered formula + variable legend table. Each card pulls from the Phase 3 equation registry. Verify: equation name renders, formula displays correctly (block-display style, centered), legend table shows symbol + description + unit per variable, MathML element is present in the DOM (open DevTools Elements panel and search for <math>).',
        ],
        'sliderSection' => [
            'title' => 'SliderInput',
            'intro' => 'Accessible controlled range input with live value display. Verify: arrow keys step by 1, PageUp/PageDown step by 10, Home/End jump to min/max, aria-valuetext updates on every change (inspect with DevTools or a screen reader), value display reflects the current value.',
            'sliderLabel' => 'Demo slider — adjust to verify keyboard behavior',
        ],
        'liveResultSection' => [
            'title' => 'LiveResult',
            'intro' => 'aria-live="polite" + aria-atomic="true" region that announces a computed value when its content changes. The demo composes SliderInput driving a radius-to-area computation, with LiveResult announcing the area in square meters. Verify: changing the slider updates the area display visually; with DevTools Elements → inspect the region you see role="status" + aria-live="polite" + aria-atomic="true"; with a screen reader (NVDA / VoiceOver) the area announces politely when the slider stops moving.',
            'sliderLabel' => 'Circle radius',
            'resultLabel' => 'Area:',
        ],
        'experienceCardSection' => [
            'title' => 'ExperienceCard',
            'intro' => 'Reusable clickable card for linking to a playground experience. Entire card is the click target (whole rectangle is interactive). Used by Phase 7 (Landing) "what else" section and Phase 9 (Playground hub). Verify: clicking anywhere on a card issues an Inertia visit; hover gives subtle elevation feedback; focus-visible shows the outline ring; cards stack on narrow viewports and grid out at larger widths. Card destinations 404 in v1 — controllers ship in Phases 8/10/11.',
            'cards' => [
                'interstellar' => [
                    'title' => 'Interstellar',
                    'description' => 'Relativistic travel demo. Drag the velocity slider; watch time dilation play out against the live Lorentz factor.',
                ],
                'cruise' => [
                    'title' => 'Cruise',
                    'description' => 'Orbital mechanics with live NASA Horizons data. Pick a destination; watch the orbital-period and orbital-velocity equations resolve.',
                ],
                'habitat' => [
                    'title' => 'Habitat',
                    'description' => 'Cylinder world surface area + composedFrom registry metadata. See how the equation registry composes equations to derive new ones.',
                ],
            ],
        ],
    ],
];
