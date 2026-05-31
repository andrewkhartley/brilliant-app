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
    'title' => 'Plan a Cruise',
    'tagline' => 'Build a trip across planets. NASA Horizons computes positions; the form solves the rest.',
    'lead' => "Pick your destinations and a departure date. We'll calculate the trip.",
    'scaffoldNote' => 'Scaffolded with :count destinations loaded from the database.',

    'review' => [
        'title' => 'Your trip',
        'lead' => 'Here is the trip we plotted. Each leg shows the distance, time, and top speed under constant 1g acceleration.',
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
            'heading' => 'Leg :number — :departure to :arrival',
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
            'body' => "NASA's Horizons service didn't answer in time. The trip-builder needs live planetary positions, so the per-leg breakdown can't render right now.",
            'retry' => 'Try again',
        ],
    ],

    'form' => [
        'submit' => 'Plan trip',
        'submitDisabledHint' => 'Pick at least one destination and a departure date to plan a trip.',

        'destinations' => [
            'label' => 'Destinations',
            'hint' => 'Order matters. Drag to reorder, or use the keyboard: Tab to focus, Space to grab, ↑/↓ to move, Space to drop.',
            'emptyState' => 'No destinations picked yet. Add one from the list below.',
            'selectedAriaLabel' => 'Selected destinations, in order',
            'availableLabel' => 'Available destinations',
            'allAddedState' => 'All destinations added.',
            'add' => 'Add :name',
            'positionLabel' => ':position.',
            'removeLabel' => 'Remove',
            'removeAriaLabel' => 'Remove :name from the itinerary',
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
                'max' => 'Eight destinations is the cruise-trip cap.',
                'invalid' => 'One or more destinations isn\'t recognized.',
            ],
            'tripStart' => [
                'required' => 'A departure date is required.',
                'past' => 'Pick a departure date today or later.',
            ],
        ],
    ],
];
