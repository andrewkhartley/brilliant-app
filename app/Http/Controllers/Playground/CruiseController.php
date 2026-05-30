<?php

namespace App\Http\Controllers\Playground;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCruiseRequest;
use App\Models\Experiences\Cruise\Destination;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Render /playground/cruise — Andrew's interplanetary trip planner.
 *
 * Phase 10 T1 shipped the scaffold (`create`); T3 grew it into an
 * interactive form; T4 wires the data path:
 *
 *  - `create` (GET)  — hands the destination catalog to the form page.
 *  - `store`  (POST) — validates via StoreCruiseRequest, flashes the
 *    validated payload under the `cruise` key, redirects to the
 *    (T5) review route.
 *
 * **Why `store` doesn't call `tripBuild` yet.** The lifted Cruise
 * controller pattern (verified against the 2024 undaunted-archive
 * source: `app/Http/Controllers/Experiences/CruiseController.php`)
 * defers `TripBuilderService::tripBuild()` to the read/review action,
 * not to store. That keeps `store` cheap (no Horizons API calls during
 * a redirect) and lets the review page own both the trip computation
 * AND the Horizons-error fallback panel that T6 adds. T5 wires the
 * `review` action that consumes the flash data; T6 wraps the
 * `tripBuild` call in try/catch for the friendly fallback.
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

    /**
     * Validate the cruise form and hand the payload to the review page
     * via flash data. The review page (T5) will pull `session('cruise')`,
     * call `TripBuilderService::tripBuild()`, and render the per-leg
     * breakdown — or render the (T6) Horizons-error fallback if the
     * upstream API misbehaves.
     */
    public function store(StoreCruiseRequest $request): RedirectResponse
    {
        // URL-based redirect (NOT route('playground.cruise.review')) because
        // T5 owns the review route registration. Using ->to() keeps T4 from
        // creating a placeholder named route that T5 would have to overwrite.
        // Until T5 ships, this redirect lands on a 404 — by design.
        return redirect('/playground/cruise/review')
            ->with('cruise', $request->validated());
    }
}
