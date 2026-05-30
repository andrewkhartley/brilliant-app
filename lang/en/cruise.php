<?php

/*
 * Solar System cruise trip-builder — Phase 10 consumer.
 *
 * Per-page namespace: controllers rendering /playground/cruise
 * must include 'cruise' in their translations() call.
 *
 * Phase 10 T1 ships the skeleton (title + lead + scaffold note).
 * T3 adds ~20 form keys; T5 adds ~10-15 review keys; T6 adds
 * ~5 error keys. Copy is PLACEHOLDER — Andrew refines over the
 * weekend; the key structure is what's load-bearing.
 */

return [
    'title' => 'Plan a Cruise',
    'tagline' => 'Build a trip across planets. NASA Horizons computes positions; the form solves the rest.',
    'lead' => "Pick your destinations and a departure date. We'll calculate the trip.",
    'scaffoldNote' => 'Scaffolded with :count destinations loaded from the database.',
];
