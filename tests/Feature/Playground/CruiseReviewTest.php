<?php

/** @noinspection PhpUndefinedMethodInspection — `assertInertia` is a TestResponse macro registered by inertia-laravel; PHPStorm doesn't pick up runtime macros without the IDE helper plugin. */
/** @noinspection PhpUnhandledExceptionInspection — Horizons calls @throws GuzzleException; tests stub the upstream so the exception is never actually thrown. */

use App\Services\API\HorizonService;
use Database\Seeders\SolarSystemFactsSeeder;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Psr7\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\followingRedirects;
use function Pest\Laravel\get;
use function Pest\Laravel\withSession;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(SolarSystemFactsSeeder::class);
});

/*
 * Phase 10 T5 — GET /playground/cruise/review
 *
 * The review action reads `session('cruise')` (flashed by the T4 store
 * action), transforms the flat destination list into the leg-shape
 * `DestinationService` expects, calls `prepareDestinationsData()` +
 * `tripBuild()`, then renders the per-leg breakdown.
 *
 * Test boundaries:
 *  - Stub the API HorizonService so tests never hit JPL (deterministic
 *    + offline-safe + fast). The fixture returns a tight 5-entry data
 *    block that covers a 24-hour window around the trip start, enough
 *    for `coordBuild()` to find a "closest match" for every body.
 *  - Run with a real session so the flashed `cruise` payload survives
 *    the redirect into the review GET.
 */

function fakeHorizonFixture(string $id, int $startTimestamp): array
{
    // 5 evenly-spaced samples across a 24-hour window — coordBuild walks
    // the array looking for the closest timestamp to legStart, so as
    // long as one sample brackets the trip start the calculator finds
    // valid coordinates. Numbers are plausible solar-system magnitudes
    // (km), distinct per body so distances don't collapse to zero.
    $bodyOffset = intval($id) * 1e6;
    $data = [];

    for ($i = 0; $i < 5; $i++) {
        $ts = $startTimestamp + ($i * 21600); // 6h apart
        $data[] = [
            'timestamp' => date('Y-m-d H:i', $ts),
            'x' => (string) ($bodyOffset + $i * 1e5),
            'y' => (string) ($bodyOffset - $i * 1e5),
            'z' => (string) ($i * 1e3),
        ];
    }

    return [
        'id' => $id,
        'stepSize' => 1440,
        'duration' => 1,
        'entries' => 5,
        'data' => $data,
    ];
}

function stubHorizonService(): void
{
    $stub = Mockery::mock(HorizonService::class);
    $stub->shouldReceive('horizonQuery')
        ->andReturnUsing(fn (string $id, int $start, ?int $step = null, ?int $dur = null): array => fakeHorizonFixture($id, $start));

    // Replace the API-level HorizonService AND the HorizonCache binding
    // so every consumer in the trip-builder pipeline gets the stub.
    // HorizonCache wraps HorizonService — substituting at the API layer
    // means the cache wraps our stub (cache miss = stub call).
    app()->instance(HorizonService::class, $stub);
}

it('redirects to the cruise form when the review URL is visited cold (no flash)', function () {
    $response = get('/playground/cruise/review');

    $response->assertRedirect('/playground/cruise');
});

it('renders the review page with leg data when the flash payload is present', function () {
    stubHorizonService();

    $tripStart = now()->addDays(14)->toDateString();

    $response = withSession([
        'cruise' => [
            'destinations' => ['mer'],
            'layovers' => [5],
            'tripStart' => $tripStart,
        ],
    ])->get('/playground/cruise/review');

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('playground/cruise-review')
            ->where('cruise.tripStart', $tripStart)
            ->where('cruise.destinations', ['mer'])
            ->where('horizonsError', false)
            ->has('trip.legs')
            ->where('trip.legs.0.departure', 'ear')
            ->where('trip.legs.0.arrival', 'mer')
            ->where('trip.legs.1.departure', 'mer')
            ->where('trip.legs.1.arrival', 'ear')
    );
});

it('flows from form submission through to a rendered review page', function () {
    stubHorizonService();

    $tripStart = now()->addDays(7)->toDateString();

    $response = followingRedirects()->post('/playground/cruise', [
        'destinations' => ['ven', 'mar'],
        'layovers' => [5, 5],
        'tripStart' => $tripStart,
    ]);

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('playground/cruise-review')
            ->where('horizonsError', false)
            ->has('trip.legs', 3) // ear → ven → mar → ear
    );
});

it('surfaces per-leg depth (coordinates, dilation, burn/cruise) and trip totals in the inertia payload', function () {
    stubHorizonService();

    $tripStart = now()->addDays(10)->toDateString();

    $response = withSession([
        'cruise' => [
            'destinations' => ['mer'],
            'layovers' => [5],
            'tripStart' => $tripStart,
        ],
    ])->get('/playground/cruise/review');

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            // Trip-level totals from CumulativeService::calc().
            ->has('trip.totalOrbDurFormatted')
            ->has('trip.totalDilationFormatted')
            // Per-leg secondary detail surface.
            ->has('trip.legs.0.dilationFormatted')
            ->has('trip.legs.0.burnDurationFormatted')
            ->has('trip.legs.0.cruiseDurationFormatted')
            ->has('trip.legs.0.depCoordinates.x')
            ->has('trip.legs.0.depCoordinates.y')
            ->has('trip.legs.0.depCoordinates.z')
            ->has('trip.legs.0.arrCoordinates.x')
            ->has('trip.legs.0.arrCoordinates.y')
            ->has('trip.legs.0.arrCoordinates.z')
    );
});

it('renders the horizons-error placeholder when the upstream API throws', function () {
    $stub = Mockery::mock(HorizonService::class);
    $stub->shouldReceive('horizonQuery')
        ->andThrow(new ConnectException(
            'JPL is taking the day off',
            new Request('GET', 'https://ssd.jpl.nasa.gov/api/horizons.api'),
        ));
    app()->instance(HorizonService::class, $stub);

    $tripStart = now()->addDays(3)->toDateString();

    $response = withSession([
        'cruise' => [
            'destinations' => ['jup'],
            'layovers' => [5],
            'tripStart' => $tripStart,
        ],
    ])->get('/playground/cruise/review');

    $response->assertOk();
    $response->assertInertia(
        fn ($page) => $page
            ->component('playground/cruise-review')
            ->where('horizonsError', true)
            ->where('trip', null)
    );
});
