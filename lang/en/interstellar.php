<?php

/*
 * Interstellar experience translations — populated in Phase 8.
 *
 * Page-level keys + per-component key structures. P8.T1 shipped 14
 * placeholder keys; P8.T3 replaced 4 of the 5 placeholder blocks
 * (destinationSelect, durationToggle, resultPanel) with real key
 * structures, and added new accelerationSlider + equationCard
 * subnamespaces for components added in T3. modeToggle and
 * fuelVisualization placeholders STAY until P8.T4 promotes them.
 *
 * Copy is PLACEHOLDER pending Andrew's weekend pass. Structure is
 * what matters here.
 */

return [
    'pageTitle' => 'Interstellar — Brilliant',
    'pageDescription' => 'A relativity travel agency. Pick a destination, set your acceleration, watch time dilation play out.',
    'heading' => 'Interstellar',
    'intro' => 'A relativity travel agency. Pick a destination, set your acceleration, and watch time dilation reshape the trip.',

    'modeToggle' => [
        'placeholderTitle' => 'ModeToggle',
        'placeholderNote' => 'Coming in P8.T4 — Beginner vs Just the math toggle.',
    ],

    'destinationSelect' => [
        'label' => 'Destination',
        'ariaLabel' => 'Choose a destination',
        'hint' => 'Each destination shows its distance in light-years.',
        'optionFormat' => ':name (:distance ly)',
    ],

    'accelerationSlider' => [
        'label' => 'Constant acceleration',
        'valueFormat' => ':value m/s² (:g g)',
        'ariaValueText' => ':value meters per second squared',
    ],

    'durationToggle' => [
        'label' => 'Highlight time',
        'subjectiveLabel' => 'Traveler time',
        'earthLabel' => 'Earth time',
        'hint' => 'Both clocks display in the result panel; the toggle highlights one as primary.',
    ],

    'resultPanel' => [
        'title' => 'Trip',
        'dilationLabel' => 'Dilation factor',
        'dilationFormat' => 'γ ≈ :value',
        'earthTimeLabel' => 'Earth time',
        'properTimeLabel' => 'Traveler time',
        'fuelLabel' => 'Fuel-equivalent',
        'yearsFormat' => ':value years',
        'primaryHint' => 'Highlighted as primary by the toggle above.',
    ],

    'equationCard' => [
        'toggleHint' => 'Toggle to "Just the math" mode above to show the relativistic speed equation.',
        'hiddenLabel' => 'Equation card hidden in Beginner mode.',
    ],

    'fuelVisualization' => [
        'placeholderTitle' => 'FuelVisualization',
        'placeholderNote' => 'Coming in P8.T4 — mass-ratio text + horizontal bar visualization.',
    ],
];
