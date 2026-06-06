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
    'pageTitle' => 'Interstellar',
    'pageDescription' => 'A relativity travel agency. Pick a destination, set your acceleration, watch time dilation play out.',
    'heading' => 'Interstellar Settlement Planner',
    'intro' => 'A planning room for possible homes beyond the solar system. Pick a destination, set the propulsion assumptions, and watch time, energy, and arrival strategy reshape the mission.',

    'introduction' => [
        'eyebrow' => 'Before the calculator',
        'title' => 'A settlement plan starts as a destination, then becomes a constraint map.',
        'bodyA' => 'Interstellar travel is easy to imagine as a line between two stars. The harder question is whether humans can arrive with time, energy, and enough remaining mass for the trip to mean anything.',
        'bodyB' => 'That makes relativity a useful storytelling engine. A traveler can experience one timeline while Earth experiences another, and both are true. The calculator keeps those clocks side by side.',
        'bodyC' => 'The controls are deliberately practical: choose a target, set the acceleration, cap the cruise speed, pick a fuel, and decide whether this is a flyby or an arrival. Every setting changes what kind of settlement story is still plausible.',
    ],

    'stage' => [
        'openButton' => 'Open the mission brief',
        'scenes' => [
            'arrival' => [
                'speaker' => 'Nisha',
                'dialogue' => 'Settlement planning starts with a name on a star chart. Today that name is :destination. The question is not only whether we can reach it, but what the trip asks us to become on the way.',
            ],
            'time' => [
                'speaker' => 'Nisha',
                'dialogue' => 'With the current settings, Earth waits about :earthTime while the traveler experiences about :travelerTime. Relativity turns one mission into two honest clocks.',
            ],
            'energy' => [
                'speaker' => 'Nisha',
                'dialogue' => 'The selected fuel is :fuel, and the fuel mass ratio reads :massRatio. That is where a settlement proposal stops being a poster and starts becoming engineering.',
            ],
            'choice' => [
                'speaker' => 'Nisha',
                'dialogue' => 'Now change the premise. A little more acceleration, a different fuel, or a flyby instead of arrival can completely rewrite the plan.',
                'calculator' => 'Back to the calculator',
                'timeAgain' => 'Explain the two clocks again',
            ],
        ],
    ],

    'planner' => [
        'eyebrow' => 'Mission constraints',
        'title' => 'Tune the settlement premise',
        'body' => 'The inputs stay close together because the variables are not independent. Fuel limits speed, speed changes time dilation, and the arrival profile decides whether this is a visit or a high-speed look through the window.',
    ],

    'possibilities' => [
        'eyebrow' => 'What else is possible',
        'title' => 'A starship calculator can become a community design studio.',
        'body' => 'This proof of concept treats the math as a planning surface. A fuller version could turn destination choices into scenarios, debates, and design challenges where learners justify assumptions instead of only reading results.',
        'items' => [
            'settlements' => [
                'title' => 'Settlement proposals',
                'body' => 'Learners could compare candidate stars, define mission goals, and argue which constraints make a destination worth pursuing.',
            ],
            'shipDesign' => [
                'title' => 'Ship design tradeoffs',
                'body' => 'Acceleration, fuel, shielding, cruise speed, and arrival strategy could become an optimization challenge with visible consequences.',
            ],
            'storyScenarios' => [
                'title' => 'Scenario-driven lessons',
                'body' => 'A rescue mission, generation ship, research probe, or first-colony attempt can use the same equations with different stakes.',
            ],
            'community' => [
                'title' => 'Community mission reviews',
                'body' => 'Users could publish mission plans, critique assumptions, remix routes, and compete to meet constraints with clearer explanations.',
            ],
        ],
    ],

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
