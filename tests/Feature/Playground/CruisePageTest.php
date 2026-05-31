<?php

/** @noinspection PhpUndefinedMethodInspection — `assertInertia` is a TestResponse macro registered by inertia-laravel; PHPStorm doesn't pick up runtime macros without the IDE helper plugin. */

use App\Models\Experiences\Cruise\Destination;
use Database\Seeders\SolarSystemFactsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\get;
use function Pest\Laravel\post;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->seed(SolarSystemFactsSeeder::class);
});

it('renders the cruise form page with destinations from the database', function () {
    $response = get('/playground/cruise');

    $response->assertOk();
    expect(Destination::count())->toBe(11);
});

it('hands all 11 destinations to the Inertia page as {code, name} pairs', function () {
    $response = get('/playground/cruise');

    $response->assertInertia(
        fn ($page) => $page
            ->component('playground/cruise')
            ->has('destinations', 11)
            ->where('destinations.0.code', 'sun')
            ->has('destinations.0.name')
    );
});

it('shares the cruise translation namespace for the form labels', function () {
    $response = get('/playground/cruise');

    $response->assertInertia(
        fn ($page) => $page
            ->where('translations.cruise.form.submit.idle', 'Plan trip')
            ->where('translations.cruise.form.submit.plotting', 'Plotting trajectory…')
            ->where('translations.cruise.form.destinations.label', 'Destinations')
            ->where('translations.cruise.form.date.label', 'Departure date')
    );
});

/*
 * Phase 10 T4 — POST /playground/cruise (StoreCruiseRequest + store action).
 *
 * The store action flashes the validated payload under the `cruise`
 * session key and redirects to /playground/cruise/review (T5's GET
 * route — not registered yet, by design). These tests assert the
 * validation surface + the flash + the redirect target.
 */

it('accepts a valid trip submission and flashes the payload to the cruise page', function () {
    $response = post('/playground/cruise', [
        'destinations' => ['mer', 'ven'],
        'layovers' => [5, 5],
        'tripStart' => now()->addDays(7)->toDateString(),
    ]);

    $response->assertRedirect('/playground/cruise');
    $response->assertSessionHas('cruiseReady', true);
    $response->assertSessionHas('cruise', [
        'destinations' => ['mer', 'ven'],
        'layovers' => [5, 5],
        'tripStart' => now()->addDays(7)->toDateString(),
    ]);
});

it('rejects an empty destinations list with a 302 + error bag', function () {
    $response = post('/playground/cruise', [
        'destinations' => [],
        'layovers' => [],
        'tripStart' => now()->addDays(7)->toDateString(),
    ]);

    $response->assertSessionHasErrors(['destinations']);
});

it('rejects more than 8 destinations', function () {
    $response = post('/playground/cruise', [
        'destinations' => ['mer', 'ven', 'ear', 'mar', 'jup', 'sat', 'ura', 'nep', 'plu'],
        'layovers' => [5, 5, 5, 5, 5, 5, 5, 5, 5],
        'tripStart' => now()->addDays(7)->toDateString(),
    ]);

    $response->assertSessionHasErrors(['destinations']);
});

it('rejects a past trip-start date', function () {
    $response = post('/playground/cruise', [
        'destinations' => ['mer'],
        'layovers' => [5],
        'tripStart' => now()->subDay()->toDateString(),
    ]);

    $response->assertSessionHasErrors(['tripStart']);
});

it('rejects a destination code that is not in the catalog', function () {
    $response = post('/playground/cruise', [
        'destinations' => ['not-a-real-place'],
        'layovers' => [5],
        'tripStart' => now()->addDays(7)->toDateString(),
    ]);

    $response->assertSessionHasErrors(['destinations.0']);
});

/*
 * Phase 10 T5.6 — per-destination layovers.
 *
 * The cross-field "layovers length must match destinations length" rule
 * lives in StoreCruiseRequest::withValidator() because Laravel's `size:`
 * rule resolves its argument before array-shape validation runs. The
 * tests below pin both the happy path (matching lengths pass through)
 * and the four boundary failures (out of range low, out of range high,
 * mismatched length, missing entirely).
 */

it('accepts duplicate destination codes when layovers are valid', function () {
    // Two Mercurys, two different layovers — the form's new flow when
    // a user clicks "Add Mercury" twice and sets each slot's days.
    $response = post('/playground/cruise', [
        'destinations' => ['mer', 'mer'],
        'layovers' => [3, 10],
        'tripStart' => now()->addDays(7)->toDateString(),
    ]);

    $response->assertRedirect('/playground/cruise');
    $response->assertSessionHas('cruiseReady', true);
    $response->assertSessionHas('cruise', [
        'destinations' => ['mer', 'mer'],
        'layovers' => [3, 10],
        'tripStart' => now()->addDays(7)->toDateString(),
    ]);
});

it('rejects layovers with a length that does not match destinations', function () {
    $response = post('/playground/cruise', [
        'destinations' => ['mer', 'ven'],
        'layovers' => [5],
        'tripStart' => now()->addDays(7)->toDateString(),
    ]);

    $response->assertSessionHasErrors(['layovers']);
});

it('rejects a layover at 0 days (below the 1-day minimum)', function () {
    $response = post('/playground/cruise', [
        'destinations' => ['mer'],
        'layovers' => [0],
        'tripStart' => now()->addDays(7)->toDateString(),
    ]);

    $response->assertSessionHasErrors(['layovers.0']);
});

it('rejects a layover at 91 days (above the 90-day maximum)', function () {
    $response = post('/playground/cruise', [
        'destinations' => ['mer'],
        'layovers' => [91],
        'tripStart' => now()->addDays(7)->toDateString(),
    ]);

    $response->assertSessionHasErrors(['layovers.0']);
});

it('rejects a missing layovers field', function () {
    $response = post('/playground/cruise', [
        'destinations' => ['mer'],
        'tripStart' => now()->addDays(7)->toDateString(),
    ]);

    $response->assertSessionHasErrors(['layovers']);
});
