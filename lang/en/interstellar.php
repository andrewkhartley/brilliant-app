<?php

/*
 * Interstellar experience translations — populated in Phase 8.
 *
 * Page-level keys + per-component key structures. P8.T1 shipped 14
 * placeholder keys; P8.T3 promoted 4 placeholder blocks
 * (destinationSelect, durationToggle, resultPanel) and added
 * accelerationSlider + equationCard. P8.T4.8 (current) wires the
 * page to the new 3-phase math + fuel-budget equations, adds 4 new
 * control blocks (fuelSelector, efficiencySlider, stopToggle,
 * maxSpeedSlider), promotes the fuelVisualization placeholder, and
 * expands the resultPanel block with cruise-breakdown + fuel-budget
 * zones.
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
        'label' => 'Interface mode',
        'ariaLabel' => 'Choose interface mode',
        'beginnerLabel' => 'Beginner',
        'mathLabel' => 'Just the math',
        'hint' => 'Beginner mode hides the equation. Just the math reveals it.',
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

    'fuelSelector' => [
        'label' => 'Fuel',
        'ariaLabel' => 'Choose a fuel type',
        'hint' => 'Each fuel shows its specific energy as a percentage of matter-antimatter annihilation.',
        'optionFormat' => ':name (:percent% of antimatter)',
    ],

    'efficiencySlider' => [
        'label' => 'Energy-conversion efficiency',
        'valueFormat' => ':value%',
        'ariaValueText' => ':value percent',
        'hint' => 'How much of the fuel\'s specific energy actually becomes exhaust kinetic energy.',
    ],

    'stopToggle' => [
        'label' => 'Arrival profile',
        'stopLabel' => 'Decelerate to rest',
        'flybyLabel' => 'Fly by',
        'ariaLabel' => 'Choose arrival profile',
        'hint' => 'Decelerating doubles the Δv budget — and the fuel — but lets you actually visit.',
    ],

    'maxSpeedSlider' => [
        'label' => 'Maximum cruise speed',
        'valueFormat' => ':value km/s (:c% c)',
        'ariaValueText' => ':value kilometers per second',
        'hint' => 'Capped by the selected fuel\'s practical ceiling.',
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
        'cruiseBreakdownTitle' => 'Trip breakdown',
        'accelDistanceLabel' => 'Acceleration distance',
        'accelDurationLabel' => 'Acceleration duration',
        'cruiseDistanceLabel' => 'Cruise distance',
        'cruiseDurationLabel' => 'Cruise duration',
        'noCruiseLabel' => 'No cruise — continuous acceleration the whole way.',
        'exhaustVelocityLabel' => 'Effective exhaust velocity',
        'exhaustVelocityFormat' => ':fraction c (:mps km/s)',
        'lightYearsFormat' => ':value ly',
        'secondsFormat' => ':value s',
    ],

    'equationCard' => [
        'toggleHint' => 'Toggle to "Just the math" mode above to show the relativistic speed equation.',
        'hiddenLabel' => 'Equation card hidden in Beginner mode.',
    ],

    'fuelVisualization' => [
        'title' => 'Fuel mass ratio',
        'massRatioLabel' => 'Initial / final mass',
        'massRatioFormat' => ':value×',
        'ariaLabel' => 'Mass ratio visualization: initial-to-final mass is :value times',
        'offChartLabel' => 'Off the chart — Δv approaches the speed of light.',
        'caption' => 'Mass ratio of fuelled-up ship to dry ship at arrival. Lower is better; 100× and beyond is unrealistic.',
    ],
];
