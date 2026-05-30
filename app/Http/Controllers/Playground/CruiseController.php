<?php

namespace App\Http\Controllers\Playground;

use App\Http\Controllers\Controller;
use App\Models\Experiences\Cruise\Destination;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Render /playground/cruise — Andrew's interplanetary trip planner.
 *
 * Phase 10 T1 ships the scaffold: this controller's `create` action
 * reads destinations from the freshly-seeded `solar_system_facts` table
 * (via the cached collection on the Destination model) and hands the
 * minimal `{code, name}` shape to the React page so the count is
 * visible end-to-end. T3 grows this into a full Inertia form.
 */
class CruiseController extends Controller
{
    public function create(): Response
    {
        $destinations = Destination::getCachedFacts()
            ->map(fn (Destination $destination): array => [
                'code' => $destination->destination_code,
                'name' => $destination->destination,
            ])
            ->values()
            ->all();

        return Inertia::render('playground/cruise', [
            'destinations' => $destinations,
            'translations' => translations(['cruise']),
        ]);
    }
}
