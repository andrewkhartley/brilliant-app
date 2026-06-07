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
    'heading' => 'Interstellar Navigation',
    'intro' => 'A planning room for possible homes beyond our solar system. Pick a destination, set the propulsion, and see how the limits of physics advise the future of your mission.',

    'introduction' => [
        'eyebrow' => 'Pre-Trip Considerations',
        'title' => 'A settlement plan starts as a destination, then becomes a constraint map.',
        'bodyA' => 'Interstellar travel is easy to imagine as a line between two stars, but some of these trips will be multi-generation. Anyone who ever made the decision to leave a home understands the weight, but to a new star system, there truly is no turning back.',
        'bodyB' => 'Since we\'re going faster, we get to play a bit with relativity! A traveler can experience one timeline while Earth experiences another, and both are true from their own perspective. The calculator keeps those clocks side by side.',
        'bodyC' => 'Choose a target, set the acceleration, cap the cruise speed, pick a fuel, and decide whether this is a flyby or an arrival. There is a lot more level of complexity that can be baked in, but this is a good start!',
    ],

    'stage' => [
        'openButton' => 'Open the mission brief',
        'scenes' => [
            'arrival' => [
                'speaker' => 'Nisha',
                'dialogue' => 'Settlement planning starts with a name on a star chart. Today that name is :destination. This isn\'t your typical road trip. Depending on the destination, you will be in a whole new stage of life!',
            ],
            'time' => [
                'speaker' => 'Nisha',
                'dialogue' => 'With the current settings, Earth waits about :earthTime while the traveler experiences about :travelerTime. Because of the weight of fuel, our best known methods of acceleration will hit a limit before the curve of relativity takes off, but some clever person may find a way to change that potential.',
            ],
            'energy' => [
                'speaker' => 'Nisha',
                'dialogue' => 'The selected fuel is :fuel, and the fuel mass ratio reads :massRatio. That is where a settlement proposal stops being a poster and starts becoming engineering.',
            ],
            'choice' => [
                'speaker' => 'Nisha',
                'dialogue' => 'Now change the premise. A little more acceleration, a different fuel, or a flyby instead of arrival can completely rewrite the plan.',
                'calculator' => 'Back to the calculator',
                'timeAgain' => 'Explain it again?',
            ],
        ],
    ],

    'planner' => [
        'eyebrow' => 'To Horizons Unseen',
        'title' => 'Tune the settlement premise',
        'body' => 'The inputs stay close together because the variables are not independent. Fuel limits speed, speed changes time dilation, and the arrival profile decides whether this is a visit or a high-speed look through the window.',
        'controlsEyebrow' => 'Mission variables',
        'controlsTitle' => 'Change the premise',
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

    'destinationSelect' => [
        'label' => 'Destination',
        'ariaLabel' => 'Choose a destination',
        'hint' => 'Each destination shows its distance in light-years.',
        'optionFormat' => ':name (:distance ly)',
    ],

    'destinationPicker' => [
        'label' => 'Destination',
        'summary' => ':distance ly / :source',
        'presetSource' => 'Preset destination',
        'modalEyebrow' => 'Target selection',
        'modalTitle' => 'Choose a destination',
        'modalBody' => 'Pick one of the prepared destinations or search for a target. Gaia-backed results can update the trip distance using RA, Dec, and parallax.',
        'close' => 'Close destination picker',
    ],

    'starSearch' => [
        'label' => 'Search a destination',
        'placeholder' => 'Try Proxima, Andromeda, Sirius...',
        'hint' => 'Prepared destinations appear first. Search resolves names to sky coordinates, then asks Gaia DR3 for RA, Dec, and parallax-based distance when the archive responds.',
        'loading' => 'Searching targets...',
        'error' => 'The target search did not answer. Try one of the preset destinations.',
        'suggestionsLabel' => 'Prepared destinations',
        'resultsLabel' => 'Matching targets',
        'empty' => 'No matching targets came back. Try a common star name like Polaris, Vega, Sirius, or Proxima.',
        'selectedLabel' => 'Selected target',
        'coordinateFormat' => 'RA :ra deg / Dec :dec deg / :distance ly',
        'resultFormat' => ':distance ly / RA :ra / Dec :dec',
    ],

    'accelerationSlider' => [
        'label' => 'Constant acceleration',
        'valueFormat' => ':value m/s² (:g g)',
        'ariaValueText' => ':value meters per second squared',
    ],

    'fuelSelector' => [
        'label' => 'Fuel',
        'ariaLabel' => 'Choose a fuel type',
        'hint' => 'Each fuel shows its specific energy as a percentage of matter-antimatter annihilation.',
        'optionFormat' => ':name (:percent% of antimatter)',
    ],

    'fuelPicker' => [
        'label' => 'Fuel and energy',
        'efficiencySummary' => ':value% efficiency',
        'massRatioSummary' => 'Mass ratio :value',
        'modalEyebrow' => 'Fuel budget',
        'modalTitle' => 'Tune the fuel premise',
        'modalBody' => 'Fuel choice and energy-conversion efficiency decide the practical ceiling for speed and the mass ratio required to make the trip.',
        'close' => 'Close fuel settings',
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
        'editValue' => 'Edit maximum cruise speed',
        'hint' => 'Capped by the selected fuel\'s practical ceiling.',
        'expandedHint' => 'The speed is capped just below the speed of light.',
        'relativisticLimitLabel' => 'Explore beyond known fuel limits',
        'modalEyebrow' => 'Cruise speed',
        'modalTitle' => 'Set maximum cruise speed',
        'close' => 'Close cruise speed editor',
        'percentMode' => '% of c',
        'kmpsMode' => 'km/s',
        'percentInputLabel' => 'Percent of light speed',
        'kmpsInputLabel' => 'Maximum speed in km/s',
        'done' => 'Done',
    ],

    'resultPanel' => [
        'title' => 'Trip',
        'dilationLabel' => 'Dilation factor',
        'dilationFormat' => 'γ ≈ :value',
        'earthTimeLabel' => 'Earth time',
        'properTimeLabel' => 'Traveler time',
        'deltaFromEarth' => '(:value less than Earth)',
        'fuelLabel' => 'Fuel-equivalent',
        'yearsFormat' => ':value years',
        'relativityTitle' => 'Relativity',
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

    'fuelVisualization' => [
        'title' => 'Fuel mass ratio',
        'massRatioLabel' => 'Initial / final mass',
        'massRatioFormat' => ':value×',
        'ariaLabel' => 'Mass ratio visualization: initial-to-final mass is :value times',
        'offChartLabel' => 'off the chart because delta-v approaches the speed of light',
        'caption' => 'Mass ratio of fuelled-up ship to dry ship at arrival. Lower is better; 100× and beyond is unrealistic.',
    ],
];
