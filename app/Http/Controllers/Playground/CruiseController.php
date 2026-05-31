<?php

namespace App\Http\Controllers\Playground;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCruiseRequest;
use App\Models\Experiences\Cruise\Destination;
use App\Services\Experiences\Cruise\DestinationService;
use App\Services\Experiences\Cruise\TripBuilderService;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Render /playground/cruise — Andrew's interplanetary trip planner.
 *
 * Phase 10 spans four user-facing actions:
 *
 *  - `create` (GET /playground/cruise)        — destination picker + date form
 *  - `store`  (POST /playground/cruise)       — validates + flashes payload
 *  - `review` (GET /playground/cruise/review) — computes trip + renders breakdown
 *  - (T6 adds the friendly fallback when Horizons throws)
 *
 * **Why `store` doesn't call `tripBuild`.** Trip computation needs live
 * Horizons data (cached file-side via T2's `HorizonCache`); doing it
 * inside `store` would couple the redirect to a JPL round-trip. By
 * deferring to `review`, a refresh on the review page re-runs the
 * computation against the same flashed payload — and the cache makes
 * the second pass instant.
 */
class CruiseController extends Controller
{
    /**
     * Default layover at each stop, in days. Matches the initial value
     * the lifted Undaunted Cruise form set per destination. Pinned as
     * a constant so the per-stop form (future) can override on a
     * per-leg basis without touching the service signature.
     */
    private const int DEFAULT_LAYOVER_DAYS = 5;

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
     * via flash data. The review page pulls `session('cruise')`, calls
     * `TripBuilderService::tripBuild()`, and renders the per-leg
     * breakdown — or (T6) renders the Horizons-error fallback if the
     * upstream API misbehaves.
     */
    public function store(StoreCruiseRequest $request): RedirectResponse
    {
        return redirect()->route('playground.cruise.review')
            ->with('cruise', $request->validated());
    }

    /**
     * Build the trip from the flashed form payload and render the
     * per-leg breakdown page.
     *
     * Data flow:
     *  1. Pull `{destinations: [...], tripStart: 'YYYY-MM-DD'}` from session flash.
     *  2. Transform the flat code list into the leg-shape
     *     `DestinationService::prepareDestinationsData()` expects:
     *     each entry is `['destination' => 'mer', 'name' => 'Mercury']`.
     *     `prependAndAppendEarth()` then bookends the list with Earth
     *     so every cruise starts AND ends back home.
     *  3. `prepareDestinationsData()` calls Horizons (cached via T2)
     *     for each unique body and attaches the orbital data.
     *  4. `tripBuild()` consumes `tripData` (keyed by `tripDate` — the
     *     PHP service strtotime()s the string) plus the enriched
     *     destinations and returns the full computed itinerary
     *     (legData, totals, finalDuration, etc.).
     *  5. The page receives the trip + per-leg asset URLs so each leg's
     *     2-plane scene can render planet PNG over a nebula background.
     *
     * Horizons error handling: wrap the prepare + build calls in
     * try/catch for `GuzzleException`. On failure, log the error and
     * re-render with `horizonsError = true` so the page can show
     * (T6) the friendly fallback panel instead of crashing.
     */
    public function review(
        DestinationService $destinationService,
        TripBuilderService $tripBuilderService,
    ): Response|RedirectResponse {
        $cruise = session('cruise');

        // Direct visit (no flash) — bounce the user back to the form.
        // Refreshing the review page works because Inertia re-flashes
        // the payload on the redirect-to-review, but a cold visit to
        // this URL has nothing to render.
        if (! is_array($cruise) || ! isset($cruise['destinations'], $cruise['tripStart'])) {
            return redirect()->route('playground.cruise');
        }

        $destinationsInput = $this->buildDestinationsInput($cruise['destinations']);
        $tripStartTimestamp = strtotime($cruise['tripStart']);

        $tripData = [
            'tripDate' => $cruise['tripStart'],
        ];

        try {
            $destinationsData = $destinationService->prepareDestinationsData(
                $destinationsInput,
                $tripStartTimestamp,
            );

            $computedTrip = $tripBuilderService->tripBuild($tripData, $destinationsData);
        } catch (GuzzleException $exception) {
            Log::warning('Cruise review: Horizons API call failed', [
                'message' => $exception->getMessage(),
                'destinations' => $cruise['destinations'],
                'tripStart' => $cruise['tripStart'],
            ]);

            // T6 will replace `null` payload + the placeholder client
            // rendering with the proper `<HorizonsError />` component.
            return Inertia::render('playground/cruise-review', [
                'cruise' => $cruise,
                'trip' => null,
                'horizonsError' => true,
                'translations' => translations(['cruise']),
            ]);
        }

        return Inertia::render('playground/cruise-review', [
            'cruise' => $cruise,
            'trip' => $this->presentTrip($computedTrip),
            'horizonsError' => false,
            'translations' => translations(['cruise']),
        ]);
    }

    /**
     * Transform the flat destination-code list into the shape
     * `DestinationService::prepareDestinationsData()` expects.
     *
     * Each entry pairs the code (consumed by Horizons + CalculatorService
     * as the canonical body identifier) with the human name (so the
     * review page can label legs without a second DB lookup). `dur` and
     * `durType` carry layover defaults (5 days at each stop) that
     * `TripBuilderService::legSegment()` reads when computing the next
     * leg's start time. Earth is NOT prepended/appended here — that's
     * `prependAndAppendEarth()`'s job inside the service.
     *
     * Layover defaults match the lifted Undaunted form's initial values
     * (5 days per body); future enhancements can let the form override
     * these per-stop without touching the service signature.
     *
     * @param  array<int, string>  $destinationCodes
     * @return array<int, array{destination: string, name: string, dur: int, durType: string}>
     */
    private function buildDestinationsInput(array $destinationCodes): array
    {
        $catalog = Destination::getCachedFacts()->keyBy('destination_code');

        return collect($destinationCodes)
            ->map(fn (string $code): array => [
                'destination' => $code,
                'name' => $catalog->get($code)?->destination ?? $code,
                'dur' => self::DEFAULT_LAYOVER_DAYS,
                'durType' => 'day',
            ])
            ->values()
            ->all();
    }

    /**
     * Slim the computed trip down to the fields the review page
     * actually renders. `tripBuild()` returns a fat array full of
     * intermediate coordinate work (initDepCoordinates, depAdj,
     * orbital adjustments, etc.) that the per-leg breakdown doesn't
     * need — passing it raw would bloat the Inertia payload and leak
     * internal state into the JS layer.
     *
     * Strips HTML from every formatted-string field — the lifted
     * `secondsToDuration()` and friends wrap units in
     * `<span class="unit">…</span>` for the legacy Vue UI; Inertia
     * escapes those tags so users would see the literal markup. The
     * helper itself is lifted code we don't want to touch, so the
     * strip happens here at the Inertia boundary.
     *
     * Each leg surfaces what the UI cares about:
     *  - departure/arrival codes (asset selection)
     *  - departureTime / arrivalTime (display)
     *  - legDistance + cruise/burn breakdowns
     *  - depDetails + arrDetails name/code (leg headline)
     *
     * @param  array<string, mixed>  $computedTrip
     * @return array<string, mixed>
     */
    private function presentTrip(array $computedTrip): array
    {
        $legs = collect($computedTrip['legData'] ?? [])
            ->values()
            ->map(fn (array $leg): array => [
                'leg' => $leg['leg'],
                'departure' => $leg['departure'],
                'arrival' => $leg['arrival'],
                'departureName' => $leg['depDetails']['name'] ?? $leg['departure'],
                'arrivalName' => $leg['arrDetails']['name'] ?? $leg['arrival'],
                'departureTime' => strip_tags((string) $leg['departureTime']),
                'arrivalTime' => strip_tags((string) $leg['arrivalTime']),
                'distanceKm' => $leg['finalLegDetails']['legDistance'] ?? 0,
                'distanceFormatted' => strip_tags((string) ($leg['finalLegDetails']['legDistanceFormatted'] ?? '0')),
                'durationSeconds' => $leg['finalLegDetails']['legDuration'] ?? 0,
                'durationFormatted' => strip_tags((string) ($leg['finalLegDetails']['legDurationFormatted'] ?? '')),
                'maxSpeedFormatted' => strip_tags((string) ($leg['finalLegDetails']['legMaxSpeedFormatted'] ?? '0')),
                'burnDurationFormatted' => strip_tags((string) ($leg['finalLegDetails']['burnDurationFormatted'] ?? '')),
                'cruiseDurationFormatted' => strip_tags((string) ($leg['finalLegDetails']['cruiseDurationFormatted'] ?? '')),
            ])
            ->all();

        return [
            'departureTime' => $computedTrip['departureTime'] === null
                ? null
                : strip_tags((string) $computedTrip['departureTime']),
            'arrivalTime' => $computedTrip['arrivalTime'] === null
                ? null
                : strip_tags((string) $computedTrip['arrivalTime']),
            'finalDuration' => $computedTrip['finalDuration'] === null
                ? null
                : strip_tags((string) $computedTrip['finalDuration']),
            'legs' => $legs,
        ];
    }
}
