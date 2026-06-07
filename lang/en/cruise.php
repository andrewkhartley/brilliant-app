<?php

/*
 * Solar System cruise trip-builder — Phase 10 consumer.
 *
 * Per-page namespace: controllers rendering /playground/cruise
 * must include 'cruise' in their translations() call.
 *
 * Phase 10 T1 shipped the skeleton; T3 adds the ~20 form keys
 * below; T5 adds review keys; T6 adds error keys. Copy is
 * PLACEHOLDER — Andrew refines over the weekend; the key
 * structure is what's load-bearing.
 */

return [
    'title' => 'Plan a Sol Cruise',
    'tagline' => 'Build a trip across planets. NASA Horizons computes positions; the form solves the rest.',
    'lead' => "Pick your destinations and a departure date. We'll calculate the trip.",
    'scaffoldNote' => 'Scaffolded with :count destinations loaded from the database.',

    'storyIntro' => [
        'eyebrow' => 'A route through moving worlds',
        'title' => 'Planning with Physics',
        'bodyA' => 'A Sol Cruise should feel like a vacation planner, and one day, it might! This guide will make sure there\'s always something at your desetination..',
        'bodyB' => 'So here, with everything on the move, an itinerary becomes a living model of timing, distance, acceleration, and tradeoffs.',
        'bodyC' => 'Each stop adds a leg, a layover, and a new set of positions: the route is a sequence of moving targets. We will turn a travel plan into distance, duration, top speed, and a wee bit of time dilation.',
        'callout' => [
            'eyebrow' => 'Live data path',
            'title' => 'This version shows the API at work.',
            'steps' => [
                'date' => 'Pick a departure date and route.',
                'horizons' => 'The server asks NASA Horizons where each world is in space.',
                'itinerary' => 'Those positions become leg estimates for distance, duration, speed, and dilation.',
            ],
            'body' => 'A production version could use an ephemeris-driven cache so the experience feels faster and can support richer route experiments, saved comparisons, and community challenges. This version keeps the live API path visible on purpose, because part of the point is showing how real data can become a playful learning interface.',
        ],
    ],

    'stage' => [
        'openButton' => 'Open the travel desk',
        'scenes' => [
            'desk' => [
                'speaker' => 'Travel agent',
                'dialogue' => 'Welcome to the Sol Cruise desk. Most vacations start with a destination. Ours start with a small complication: the destinations are always on the move.',
            ],
            'motion' => [
                'speaker' => 'Mateo',
                'dialogue' => 'Mateo Silva, route concierge. The trip is to worlds in motion, and good timing can be the difference between an elegant transfer and an expensive scenic detour.',
            ],
            'manifest' => [
                'speaker' => 'Mateo',
                'dialogue' => 'Once you chooses a date and destinations, we\'ll plot it out! If you want to reach a certain place by a certain date, try seeing what conditions will get you there!',
            ],
            'choice' => [
                'speaker' => 'Mateo',
                'dialogue' => 'What do you say: want to get started?',
                'planner' => 'Start planning!',
                'motion' => 'Can you repeat that?',
            ],
        ],
    ],

    'possibilities' => [
        'planner' => [
            'eyebrow' => 'What else is possible',
            'title' => 'A route planner can become a lesson about timing.',
            'body' => 'The form is only the first layer. A stronger version could teach learners to compare launch windows, fuel costs, transfer arcs, and community-designed routes without making the interface feel like homework.',
        ],
        'review' => [
            'eyebrow' => 'Beyond this itinerary',
            'title' => 'The result can become a design challenge.',
            'body' => 'Once a trip exists, the next question is how to improve it. Learners could test whether a different date, destination order, layover, or transfer strategy makes the same journey faster, cheaper, or safer.',
        ],
        'items' => [
            'windows' => [
                'title' => 'Optimized launch windows',
                'body' => 'Assess each leg against planetary alignment so the route can favor lower fuel use instead of simply accepting the first available path.',
            ],
            'fuel' => [
                'title' => 'Fuel and mission budgets',
                'body' => 'Let learners trade time, acceleration, propellant, shielding, and comfort, then see which constraint becomes the real bottleneck.',
            ],
            'missions' => [
                'title' => 'Scenario-based routes',
                'body' => 'Turn the same engine into rescue missions, cargo runs, research tours, or school competitions with different success conditions.',
            ],
            'community' => [
                'title' => 'Community route design',
                'body' => 'Invite users to publish itineraries, compare strategies, explain their assumptions, and remix routes created by other learners.',
            ],
        ],
    ],

    'launchOverlay' => [
        'ariaLabel' => 'Plotting your Sol Cruise route',
        'kicker' => 'Journey preparation',
        'heading' => 'Preparing your Sol Cruise',
        'body' => 'Building a clean route for :itinerary, departing :date. We are confirming planetary positions, transfer windows, and the first-pass itinerary.',
        'dateFallback' => 'your departure window',
        'itineraryFallback' => 'deep space',
        'viewDetails' => 'View trip details',
        'ready' => [
            'heading' => 'Your itinerary is ready',
            'body' => 'The itinerary packet is loaded underneath. Open it when you are ready to review the route.',
        ],
        'panel' => [
            'label' => 'Sol Cruise desk',
            'heading' => 'Route being assembled',
            'departure' => 'Departure',
            'stops' => 'Stops',
            'route' => 'Selected route',
        ],
        'steps' => [
            'ephemeris' => 'Confirming ephemeris',
            'transfer' => 'Shaping transfer arcs',
            'itinerary' => 'Preparing itinerary',
        ],
    ],

    'review' => [
        'title' => 'Your trip is ready!',
        'kicker' => 'Itinerary received',
        'lead' => 'Here is the trip we plotted. Each leg shows the distance, time, and top speed that balance acceleration, cruise, and deceleration. Starting and ending speeds match what is needed for the destination\'s orbit.',
        'backToForm' => 'Plan a different trip',
        'summary' => [
            'heading' => 'Trip summary',
            'departureLabel' => 'Departure',
            'arrivalLabel' => 'Arrival',
            'durationLabel' => 'Total duration',
            'legsLabel' => 'Legs',
            'orbitDurationLabel' => 'Total orbit time',
            'dilationLabel' => 'Time dilation',
        ],
        'itinerary' => [
            'heading' => 'Itinerary',
            'label' => 'Trip itinerary, leg by leg',
        ],
        'leg' => [
            'heading' => 'Leg :number :.: :departure to :arrival',
            'timeRange' => ':departure → :arrival',
            'distance' => [
                'label' => 'Distance',
                'units' => 'km',
            ],
            'duration' => [
                'label' => 'Travel time',
            ],
            'maxSpeed' => [
                'label' => 'Top speed',
                'units' => 'm/s',
            ],
            'details' => [
                'show' => 'Show details',
                'hide' => 'Hide details',
                'burnLabel' => 'Burn time',
                'cruiseLabel' => 'Cruise time',
                'dilationLabel' => 'Time dilation',
                'coordinatesLabel' => 'Coordinates',
                'coordinatesUnits' => 'km',
                'departureCoordinates' => 'Departure: :x, :y, :z km',
                'arrivalCoordinates' => 'Arrival: :x, :y, :z km',
                'coordinatesUnavailable' => 'Unavailable',
            ],
        ],
        'horizonsError' => [
            'heading' => 'Out of contact',
            'body' => "NASA's Horizons service didn't answer in time. The trip-builder needs live planetary positions to plot your route — the planets often answer on the second knock.",
            'retry' => 'Try again',
            'iconAriaLabel' => 'A planet drifting just out of reach',
            'attemptedHeading' => 'The trip you picked',
            'attemptedDestinationsLabel' => 'Destinations',
            'attemptedDateLabel' => 'Departure date',
            'attemptedDestinationsSeparator' => ' → ',
            'ctaLabel' => 'Plan your trip again',
        ],
    ],

    'form' => [
        'planner' => [
            'kicker' => 'Plan Your Itinerary',
            'dateStep' => 'Departure date',
            'destinationsStep' => 'Destinations',
            'destinationCount' => ':count selected',
            'manifestHeading' => 'Trip manifest',
            'departureLabel' => 'Departure',
            'routeLabel' => 'Route',
            'noDateSelected' => 'Not selected yet',
            'noRouteSelected' => 'No destinations yet',
            'datePanelHeading' => 'Set your launch window',
            'datePanelBody' => 'Choose the date first so Horizons can anchor the planetary positions before we assemble the route.',
            'continueToDestinations' => 'Choose destinations',
            'destinationsEyebrow' => 'Route assembly',
            'destinationsPanelHeading' => 'Choose your Sol Cruise stops',
            'destinationsPanelBody' => 'Add destinations in the order you want to visit them. You can reorder stops, repeat a destination, and tune layover days before plotting.',
            'backToDate' => 'Change date',
            'sequenceHint' => 'Start with a departure date, then assemble the route.',
        ],
        'submit' => [
            'idle' => 'Plan trip',
            'plotting' => 'Plotting trajectory…',
        ],
        'submitDisabledHint' => 'Pick at least one destination and a departure date to plan a trip.',
        'plottingAriaLabel' => 'Plotting your trip :.: please wait',

        'destinations' => [
            'label' => 'Destinations',
            'hint' => 'Order matters. Drag to reorder, or use the keyboard: Tab to focus, Space to grab, ↑/↓ to move, Space to drop. Pick the same planet twice if you want two layovers there.',
            'emptyState' => 'No destinations picked yet. Add one from the list below.',
            'selectedAriaLabel' => 'Selected destinations, in order',
            'availableLabel' => 'Available destinations',
            'allAddedState' => 'All destinations added.',
            'add' => 'Add :name',
            'positionLabel' => ':position.',
            'removeLabel' => 'Remove',
            'removeAriaLabel' => 'Remove :name from the itinerary',
            'layoverLabel' => 'Days at :name',
            'layoverInputAriaLabel' => 'Days at :name',
            'layoverUnitLabel' => 'days',
        ],

        'date' => [
            'label' => 'Departure date',
            'hint' => 'Pick any date from today through five years out — that\'s the window Horizons covers comfortably.',
            'ariaLabel' => 'Trip departure date',
        ],

        'errors' => [
            'summaryHeading' => 'Please fix these before planning your trip:',
            'destinations' => [
                'min' => 'Pick at least one destination.',
                'max' => 'Eight destinations is the Sol Cruise cap.',
                'invalid' => 'One or more destinations isn\'t recognized.',
            ],
            'tripStart' => [
                'required' => 'A departure date is required.',
                'past' => 'Pick a departure date today or later.',
            ],
            'layovers' => [
                'size' => 'Layover counts must match destination count.',
                'range' => 'Layovers must be between 1 and 90 days.',
                'required' => 'Set a layover for every destination.',
            ],
        ],
    ],
];
