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
    'tagline' => 'Build a trip across planets. Use NASA\'s Horizons API or calculate from the ephemeris.',
    'lead' => "Pick your destinations and a departure date. We'll connect the dots.",
    'scaffoldNote' => 'Scaffolded with :count destinations loaded from the database.',

    'storyIntro' => [
        'eyebrow' => 'A route through moving worlds',
        'title' => 'Planning with Physics',
        'bodyA' => 'A Sol Cruise should feel like a vacation planner, and one day, it might! This guide will make sure you end up where the destination is meant to be.',
        'bodyB' => 'So here, with everything on the move, an itinerary becomes a model of timing, distance, and acceleration. Each stop adds a leg and a layover along a route of moving targets. We will turn a travel plan into distance, duration, top speed, and a wee bit of time dilation.',
        'bodyC' => '',
        'callout' => [
            'eyebrow' => 'Coordinate paths',
            'title' => 'Two ways to ask where the worlds are.',
            'steps' => [
                'date' => 'Pick a departure date, a route, and a data source.',
                'horizons' => 'NASA Horizons can provide authoritative vectors. The built-in ephemeris uses the same basic idea locally, so the map does not have to stack API queries.',
                'itinerary' => 'Either path turns coordinates into leg estimates for distance, duration, speed, and dilation.',
            ],
            'body' => 'NASA\'s coordinates come from ephemeris methods too, just with deeper observations, better models, and more powerful systems behind them. Keeping both paths visible shows what I like about learning with publicly available information and APIs: real data can become something playful, testable, and easy to explore.',
        ],
    ],

    'stage' => [
        'openButton' => 'Open the Travel Desk',
        'scenes' => [
            'desk' => [
                'speaker' => 'Travel Agent',
                'dialogue' => 'Welcome to the Sol Cruise desk. Most vacations start with a destination. We, however, have a small complication: the destinations are always on the move.',
            ],
            'motion' => [
                'speaker' => 'Mateo',
                'dialogue' => 'Mateo Silva, route concierge. The trip is to worlds in motion, and good timing can be the difference between an elegant transfer and an expensive scenic detour. For this, we are assuming access to propulsion beyond chemical rockets.',
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
        'backToForm' => 'Plan a different trip',
        'summary' => [
            'heading' => 'Trip summary',
            'eyebrow' => 'Sol Cruise Packet',
            'routeLabel' => 'Route',
            'ticketHeading' => 'Itinerary',
            'ticketBody' => 'Take this luxury cruiser around our solar system. Once we are no longer bound to the limits of chemical rockets and can provide consistent thrust, you will be amazed at how quickly we traverse our solar system. We will measure trips in days and weeks: not years.',
            'departureLabel' => 'Departure',
            'arrivalLabel' => 'Arrival',
            'durationLabel' => 'Total duration',
            'legsLabel' => 'Legs',
            'orbitDurationLabel' => 'Total orbit time',
            'dilationLabel' => 'Time dilation',
            'totalTripLabel' => 'Total trip',
            'burnDetailsLabel' => 'Burn profile',
            'cruiseDetailsLabel' => 'Cruise profile',
            'orbitDetailsLabel' => 'Orbit profile',
            'distanceLabel' => 'Distance',
            'durationValueLabel' => 'Duration',
            'dilationNoteTitle' => 'A Younger You!',
            'dilationNoteBody' => 'Time is a one-way stream that is impossible to overcome, but it can squeeze and stretch. During this trip, the traveler experiences :seconds fewer seconds than clocks back home: roughly :minutes minutes younger by arrival than if you remained on Earth.',
        ],
        'itinerary' => [
            'heading' => 'Your trip details',
            'label' => 'Trip itinerary, leg by leg',
            'tabsLabel' => 'Choose a trip leg',
            'tabLabel' => 'Leg :number',
            'activeLeg' => 'Leg :current of :total',
            'previous' => 'Previous leg',
            'next' => 'Next leg',
        ],
        'map' => [
            'eyebrow' => 'Route map',
            'title' => 'Visualize Your Trip',
            'body' => 'Want to see where you are going? Move this map around and see where your trip will take you.',
            'ariaLabel' => 'zmap of the selected Sol Cruise route',
            'simulationLabel' => 'Active waypoint',
            'interactionHint' => 'Drag to rotate the route plane. Scroll to zoom. Planetary orbits stay visible even when they are not part of this itinerary for perspective..',
            'controls' => [
                'pause' => 'Pause',
                'play' => 'Play',
                'speed' => ':speed',
                'speedLabel' => 'Simulation speed',
                'timeline' => 'Trip timeline',
            ],
            'phase' => [
                'acceleration' => 'Acceleration burn',
                'cruise' => 'Cruise segment',
                'deceleration' => 'Deceleration burn',
                'layover' => 'Layover / orbit',
            ],
            'phaseShort' => [
                'acceleration' => 'Accel',
                'cruise' => 'Cruise',
                'deceleration' => 'Decel',
                'layover' => 'Layover',
            ],
            'source' => [
                'horizons' => 'Source: live NASA Horizons vectors.',
                'ephemeris' => 'Source: coded approximate ephemeris for local route mapping and expanded destinations.',
            ],
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
                'burnDistanceLabel' => 'Burn distance',
                'burnDurationLabel' => 'Burn time',
                'cruiseDistanceLabel' => 'Cruise distance',
                'cruiseDurationLabel' => 'Cruise time',
                'flipDistanceLabel' => 'Flip distance',
                'flipDurationLabel' => 'Flip time',
                'orbitDistanceLabel' => 'Orbit distance',
                'orbitDurationLabel' => 'Orbit time',
                'orbitsLabel' => 'Orbits',
                'nextDepartureLabel' => 'Next departure',
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
            'body' => "NASA's Horizons service didn't answer in time. The trip-builder needs live planetary positions to plot your route with this method. Try again in a few minutes or switch to the ephemeris model.",
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
            'datePanelBody' => 'Choose the date first so Horizons can anchor the planetary positions and assemble an accurate trip.',
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

        'dataSource' => [
            'label' => 'Data source',
            'horizons' => [
                'title' => 'NASA Horizons',
                'body' => 'Use live vector data from NASA for the classic planet route.',
            ],
            'ephemeris' => [
                'title' => 'Ephemeris-Driven Map',
                'body' => 'Use the built-in orbit model for local map generation without stacking NASA requests.',
            ],
        ],

        'destinations' => [
            'label' => 'Destinations',
            'hint' => 'Drag to reorder, or use the keyboard: Tab to focus, Space to grab, ↑/↓ to move, Space to drop. Pick the same planet twice if you want two layovers there.',
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
