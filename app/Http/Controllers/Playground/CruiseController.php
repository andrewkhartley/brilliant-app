<?php

namespace App\Http\Controllers\Playground;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCruiseRequest;
use App\Models\Experiences\Cruise\Destination;
use App\Services\Experiences\Cruise\ApproximateEphemerisService;
use App\Services\Experiences\Cruise\DestinationService;
use App\Services\Experiences\Cruise\EphemerisCatalog;
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
    private const array MAP_PLANET_CODES = [
        'mer',
        'ven',
        'ear',
        'mar',
        'jup',
        'sat',
        'ura',
        'nep',
    ];

    /**
     * Default layover at each stop, in days. Matches the initial value
     * the lifted Undaunted Cruise form set per destination, and serves
     * two roles since T5.6:
     *  - Client-side: the form's initial-state default for a freshly
     *    added slot (the per-stop `<input type="number">` boots to
     *    this value).
     *  - Server-side: a defensive fallback inside
     *    `buildDestinationsInput()` for the (now impossible after both
     *    validators run) case where a layover index is missing.
     */
    private const int DEFAULT_LAYOVER_DAYS = 5;

    public function create(): Response
    {
        $preparedCruise = session('cruise');
        $cruiseReady = (bool) session('cruiseReady', false);

        if ($cruiseReady && is_array($preparedCruise)) {
            session()->keep(['cruise']);
        }

        $destinations = Destination::getCachedFacts()
            ->map(fn (Destination $destination): array => [
                'code' => $destination->destination_code,
                'name' => $destination->destination,
            ])
            ->values()
            ->all();

        return Inertia::render('playground/cruise', [
            'destinations' => $destinations,
            'ephemerisDestinations' => EphemerisCatalog::destinations(),
            'cruiseReady' => $cruiseReady,
            // `preparedCruise` is gated on `cruiseReady` so the form only
            // pre-fills on the just-submitted "trip is ready" landing.
            // Without this gate, the back-to-form link from the review
            // page would re-hydrate the form with the prior trip's data
            // (the cruise flash is still alive there because review's
            // `session()->keep(['cruise'])` extends it one request).
            // A user navigating back to plan a NEW trip wants a blank form.
            'preparedCruise' => $cruiseReady && is_array($preparedCruise) ? $preparedCruise : null,
            'translations' => translations(['cruise', 'storyStage']),
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
        return redirect()->route('playground.cruise')
            ->with('cruise', $request->validated())
            ->with('cruiseReady', true);
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
        ApproximateEphemerisService $ephemerisService,
        TripBuilderService $tripBuilderService,
    ): Response|RedirectResponse {
        $cruise = session('cruise');

        // Direct visit (no flash) — bounce the user back to the form.
        // Refreshing the review page works because Inertia re-flashes
        // the payload on the redirect-to-review, but a cold visit to
        // this URL has nothing to render.
        if (! is_array($cruise) || ! isset($cruise['destinations'], $cruise['tripStart'], $cruise['layovers'])) {
            return redirect()->route('playground.cruise');
        }

        session()->keep(['cruise']);

        $dataSource = $cruise['dataSource'] ?? DestinationService::DATA_SOURCE_HORIZONS;

        $destinationsInput = $this->buildDestinationsInput(
            $cruise['destinations'],
            $cruise['layovers'],
            $dataSource,
        );
        $tripStartTimestamp = strtotime($cruise['tripStart']);

        $tripData = [
            'tripDate' => $cruise['tripStart'],
            'dataSource' => $dataSource,
        ];

        try {
            $destinationsData = $destinationService->prepareDestinationsData(
                $destinationsInput,
                $tripStartTimestamp,
                $dataSource,
            );

            $computedTrip = $tripBuilderService->tripBuild($tripData, $destinationsData);
        } catch (GuzzleException $exception) {
            Log::warning('Cruise review: Horizons API call failed', [
                'message' => $exception->getMessage(),
                'destinations' => $cruise['destinations'],
                'tripStart' => $cruise['tripStart'],
            ]);

            // T6 — render the friendly `<HorizonsError />` panel.
            // Resolve destination codes to human names so the panel can
            // tell users what trip they were trying to plot. The success
            // path gets names via `presentTrip()` (from depDetails/arrDetails);
            // the error path never reaches the trip-builder, so we pull
            // the names directly from the cached destination catalog here.
            // Codes that don't resolve fall back to the raw code, matching
            // `buildDestinationsInput()`'s defensive behavior.
            $attemptedDestinationNames = collect($cruise['destinations'])
                ->map(fn (string $code): string => $this->destinationName($code, $dataSource))
                ->values()
                ->all();

            return Inertia::render('playground/cruise-review', [
                'cruise' => $cruise,
                'trip' => null,
                'horizonsError' => true,
                'attemptedDestinationNames' => $attemptedDestinationNames,
                'translations' => translations(['cruise', 'storyStage']),
            ]);
        }

        return Inertia::render('playground/cruise-review', [
            'cruise' => $cruise,
            'trip' => $this->presentTrip(
                $computedTrip,
                $tripStartTimestamp,
                $ephemerisService,
            ),
            'horizonsError' => false,
            'attemptedDestinationNames' => [],
            'translations' => translations(['cruise', 'storyStage']),
        ]);
    }

    /**
     * Transform the flat destination-code list into the shape
     * `DestinationService::prepareDestinationsData()` expects.
     *
     * Each entry pairs the code (consumed by Horizons + CalculatorService
     * as the canonical body identifier) with the human name (so the
     * review page can label legs without a second DB lookup). `dur` and
     * `durType` carry the per-stop layover that
     * `TripBuilderService::legSegment()` reads when computing the next
     * leg's start time. Earth is NOT prepended/appended here — that's
     * `prependAndAppendEarth()`'s job inside the service.
     *
     * T5.6 — `$layovers` is a parallel array (same length as
     * `$destinationCodes`), enforced by both StoreCruiseRequest's
     * `withValidator()` cross-check and the client-side zod
     * `.refine()`. Missing-index fallback to `DEFAULT_LAYOVER_DAYS`
     * is defensive: if both validators ran cleanly the index always
     * exists, but a malformed manual session-write or a future
     * refactor that bypasses the request layer shouldn't crash here.
     *
     * @param  array<int, string>  $destinationCodes
     * @param  array<int, int>  $layovers
     * @return array<int, array{destination: string, name: string, dur: int, durType: string}>
     */
    private function buildDestinationsInput(
        array $destinationCodes,
        array $layovers,
        string $dataSource,
    ): array
    {
        $catalog = Destination::getCachedFacts()->keyBy('destination_code');

        return collect($destinationCodes)
            ->map(fn (string $code, int $index): array => [
                'destination' => $code,
                'name' => $dataSource === DestinationService::DATA_SOURCE_EPHEMERIS
                    ? EphemerisCatalog::name($code)
                    : ($catalog->get($code)?->destination ?? $code),
                'dur' => (int) ($layovers[$index] ?? self::DEFAULT_LAYOVER_DAYS),
                'durType' => 'day',
            ])
            ->values()
            ->all();
    }

    private function destinationName(string $code, string $dataSource): string
    {
        if ($dataSource === DestinationService::DATA_SOURCE_EPHEMERIS) {
            return EphemerisCatalog::name($code);
        }

        $catalog = Destination::getCachedFacts()->keyBy('destination_code');

        return $catalog->get($code)?->destination ?? $code;
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
     * Each leg surfaces the prominent stats (distance, duration, max
     * speed) PLUS a secondary detail block the UI hides behind a
     * disclosure: burn time, cruise time, time dilation, and the 3D
     * departure/arrival coordinates. The depth here is intentional —
     * the math computes ~25 fields per leg and Andrew wants users to
     * see the shape of what's actually being solved, not just the
     * top-line trio.
     *
     * Trip totals expose the same depth at the trip level: total
     * orbit (layover) duration and total relativistic time dilation
     * across all legs come from `CumulativeService::calc()`, which
     * `tripBuild()` assigns to `$trip['total']`. The raw totals
     * (`totalOrbDur`, `totalDilation`) are floats in seconds; we
     * pass them through `secondsToDuration()` here so the formatting
     * matches the per-leg duration strings.
     *
     * @param  array<string, mixed>  $computedTrip
     * @return array<string, mixed>
     */
    private function presentTrip(
        array $computedTrip,
        int $tripStartTimestamp,
        ApproximateEphemerisService $ephemerisService,
    ): array
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
                'burnDistanceFormatted' => strip_tags((string) ($leg['finalLegDetails']['burnDistanceFormatted'] ?? '0')),
                'accelerationDurationSeconds' => (float) ($leg['finalLegDetails']['accBurnDuration'] ?? 0),
                'burnDurationFormatted' => strip_tags((string) ($leg['finalLegDetails']['burnDurationFormatted'] ?? '')),
                'cruiseDurationSeconds' => (float) ($leg['finalLegDetails']['cruiseDuration'] ?? 0),
                'cruiseDistanceKm' => $leg['finalLegDetails']['cruiseDistance'] ?? 0,
                'cruiseDistanceFormatted' => strip_tags((string) ($leg['finalLegDetails']['cruiseDistanceFormatted'] ?? '0')),
                'cruiseDurationFormatted' => strip_tags((string) ($leg['finalLegDetails']['cruiseDurationFormatted'] ?? '')),
                'flipDistanceFormatted' => strip_tags((string) ($leg['finalLegDetails']['flipDistanceFormatted'] ?? '0')),
                'flipDurationSeconds' => (float) ($leg['finalLegDetails']['flipDuration'] ?? 0),
                'flipDurationFormatted' => strip_tags((string) ($leg['finalLegDetails']['flipDurationFormatted'] ?? '')),
                'decelerationDurationSeconds' => (float) ($leg['finalLegDetails']['decBurnDuration'] ?? 0),
                'dilationFormatted' => strip_tags((string) ($leg['finalLegDetails']['legDilationFormatted'] ?? '')),
                'layoverDurationSeconds' => (float) ($leg['layoverDetails']['duration'] ?? 0),
                'layoverDistanceFormatted' => strip_tags((string) ($leg['layoverDetails']['distanceFormatted'] ?? '0')),
                'layoverDurationFormatted' => strip_tags((string) ($leg['layoverDetails']['durationFormatted'] ?? '')),
                'layoverQuantityFormatted' => strip_tags((string) ($leg['layoverDetails']['quantityFormatted'] ?? '0')),
                'nextDepartureDate' => strip_tags((string) ($leg['nextDepDate'] ?? '')),
                'nextDepartureTime' => strip_tags((string) ($leg['nextDepTime'] ?? '')),
                'depCoordinates' => $this->presentCoordinates($leg['depCoordinates'] ?? []),
                'arrCoordinates' => $this->presentCoordinates($leg['arrCoordinates'] ?? []),
            ])
            ->all();

        $totals = $computedTrip['total'] ?? [];
        $mapBodyCodes = $this->mapBodyCodes($legs);

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
            'tripDistanceFormatted' => strip_tags((string) ($totals['tripDistanceFormatted'] ?? '0')),
            'burnDistanceFormatted' => strip_tags((string) ($totals['burnDistanceFormatted'] ?? '0')),
            'burnDurationFormatted' => strip_tags((string) ($totals['burnDurationFormatted'] ?? '')),
            'cruiseDistanceFormatted' => strip_tags((string) ($totals['cruiseDistanceFormatted'] ?? '0')),
            'cruiseDurationFormatted' => strip_tags((string) ($totals['cruiseDurationFormatted'] ?? '')),
            'orbitDistanceFormatted' => strip_tags((string) ($totals['orbitDistanceFormatted'] ?? '0')),
            'orbitDurationFormatted' => strip_tags((string) ($totals['orbitDurationFormatted'] ?? '')),
            'tripDilationFormatted' => strip_tags((string) ($totals['tripDilationFormatted'] ?? '0')),
            'tripDilationMinutes' => strip_tags((string) ($totals['tripDilationMinutes'] ?? '0')),
            'totalOrbDurFormatted' => isset($totals['totalOrbDur'])
                ? strip_tags(secondsToDuration((int) round((float) $totals['totalOrbDur'])))
                : null,
            'totalDilationFormatted' => isset($totals['totalDilation'])
                ? strip_tags(secondsToDuration((int) round((float) $totals['totalDilation'])))
                : null,
            'mapPlanetPositions' => $this->presentMapPlanetPositions(
                $mapBodyCodes,
                $tripStartTimestamp,
                $ephemerisService,
            ),
            'mapOrbitPaths' => $this->presentMapOrbitPaths(
                $mapBodyCodes,
                $tripStartTimestamp,
                $ephemerisService,
            ),
            'legs' => $legs,
        ];
    }

    /**
     * Seed the client map with a real start angle for every visible
     * planet. The itinerary legs still use the selected source's
     * solved departure/arrival coordinates; this only prevents
     * non-selected planets from falling back to placeholder phases.
     *
     * @param  array<int, string>  $codes
     * @return array<int, array{code: string, elapsedDays: int, name: string, x: int, y: int, z: int, radiusKm: int}>
     */
    private function presentMapPlanetPositions(
        array $codes,
        int $tripStartTimestamp,
        ApproximateEphemerisService $ephemerisService,
    ): array {
        return collect($codes)
            ->map(function (string $code) use ($ephemerisService, $tripStartTimestamp): array {
                $coordinates = $ephemerisService->positionAt(
                    $code,
                    $tripStartTimestamp,
                );

                return $this->presentMapPoint(
                    elapsedDays: 0,
                    coordinates: $coordinates,
                    code: $code,
                    name: $this->destinationName(
                        $code,
                        DestinationService::DATA_SOURCE_EPHEMERIS,
                    ),
                );
            })
            ->values()
            ->all();
    }

    /**
     * @param  array<int, string>  $codes
     * @return array<int, array{code: string, name: string, periodDays: float, points: array<int, array{elapsedDays: float, x: int, y: int, z: int, radiusKm: int}>}>
     */
    private function presentMapOrbitPaths(
        array $codes,
        int $tripStartTimestamp,
        ApproximateEphemerisService $ephemerisService,
    ): array {
        return collect($codes)
            ->map(function (string $code) use ($ephemerisService, $tripStartTimestamp): ?array {
                $periodDays = $this->orbitPeriodDays($code);

                if ($periodDays === null || $periodDays <= 0) {
                    return null;
                }

                $sampleCount = 192;
                $points = [];

                for ($index = 0; $index <= $sampleCount; $index++) {
                    $elapsedDays = ($periodDays * $index) / $sampleCount;
                    $coordinates = $ephemerisService->positionAt(
                        $code,
                        $tripStartTimestamp + (int) round($elapsedDays * 86400),
                    );

                    $points[] = $this->presentMapPoint(
                        elapsedDays: $elapsedDays,
                        coordinates: $coordinates,
                    );
                }

                return [
                    'code' => $code,
                    'name' => $this->destinationName(
                        $code,
                        DestinationService::DATA_SOURCE_EPHEMERIS,
                    ),
                    'periodDays' => $periodDays,
                    'points' => $points,
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @param  array<int, array<string, mixed>>  $legs
     * @return array<int, string>
     */
    private function mapBodyCodes(array $legs): array
    {
        return collect(self::MAP_PLANET_CODES)
            ->merge(
                collect($legs)->flatMap(
                    fn (array $leg): array => [
                        $leg['departure'],
                        $leg['arrival'],
                    ],
                ),
            )
            ->filter(fn (mixed $code): bool => is_string($code) && $code !== 'sun')
            ->unique()
            ->values()
            ->all();
    }

    private function orbitPeriodDays(string $code): ?float
    {
        $localBody = EphemerisCatalog::body($code);

        if ($localBody !== null) {
            return isset($localBody['parent'])
                ? null
                : (float) $localBody['periodDays'];
        }

        $destination = Destination::getCachedFacts()->firstWhere('destination_code', $code);
        $periodDays = $destination === null ? 0 : (float) $destination->solar_orbit;

        return $periodDays > 0 ? $periodDays : null;
    }

    /**
     * @param  array{x?: mixed, y?: mixed, z?: mixed}  $coordinates
     * @return array{elapsedDays: float, x: int, y: int, z: int, radiusKm: int}
     */
    private function presentMapPoint(
        float $elapsedDays,
        array $coordinates,
        ?string $code = null,
        ?string $name = null,
    ): array {
        $x = (float) ($coordinates['x'] ?? 0);
        $y = (float) ($coordinates['y'] ?? 0);
        $z = (float) ($coordinates['z'] ?? 0);

        $point = [
            'elapsedDays' => $elapsedDays,
            'x' => (int) round($x),
            'y' => (int) round($y),
            'z' => (int) round($z),
            'radiusKm' => (int) round(sqrt(($x ** 2) + ($y ** 2) + ($z ** 2))),
        ];

        if ($code !== null) {
            $point['code'] = $code;
        }

        if ($name !== null) {
            $point['name'] = $name;
        }

        return $point;
    }

    /**
     * Normalize a coordinate triplet from the calculator output into a
     * compact `{x, y, z}` shape. `coordBuild()` returns the same keys
     * but with extra intermediate fields in some code paths; pinning
     * the wire shape here keeps the JS type stable. Values are rounded
     * to the nearest km — the underlying floats carry sub-meter
     * precision that's noise at solar-system scale.
     *
     * @param  array<string, mixed>  $coordinates
     * @return array{x: int, y: int, z: int}|null
     */
    private function presentCoordinates(array $coordinates): ?array
    {
        if (! isset($coordinates['x'], $coordinates['y'], $coordinates['z'])) {
            return null;
        }

        return [
            'x' => (int) round((float) $coordinates['x']),
            'y' => (int) round((float) $coordinates['y']),
            'z' => (int) round((float) $coordinates['z']),
        ];
    }
}
