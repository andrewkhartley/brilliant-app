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
    ],
];
