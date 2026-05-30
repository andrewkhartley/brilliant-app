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
            ->where('translations.cruise.form.submit', 'Plan trip')
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

it('accepts a valid trip submission and flashes the payload to the review URL', function () {
    $response = post('/playground/cruise', [
        'destinations' => ['mer', 'ven'],
        'tripStart' => now()->addDays(7)->toDateString(),
    ]);

    $response->assertRedirect('/playground/cruise/review');
    $response->assertSessionHas('cruise', [
        'destinations' => ['mer', 'ven'],
        'tripStart' => now()->addDays(7)->toDateString(),
    ]);
});

it('rejects an empty destinations list with a 302 + error bag', function () {
    $response = post('/playground/cruise', [
        'destinations' => [],
        'tripStart' => now()->addDays(7)->toDateString(),
    ]);

    $response->assertSessionHasErrors(['destinations']);
});

it('rejects more than 8 destinations', function () {
    $response = post('/playground/cruise', [
        'destinations' => ['mer', 'ven', 'ear', 'mar', 'jup', 'sat', 'ura', 'nep', 'plu'],
        'tripStart' => now()->addDays(7)->toDateString(),
    ]);

    $response->assertSessionHasErrors(['destinations']);
});

it('rejects a past trip-start date', function () {
    $response = post('/playground/cruise', [
        'destinations' => ['mer'],
        'tripStart' => now()->subDay()->toDateString(),
    ]);

    $response->assertSessionHasErrors(['tripStart']);
});

it('rejects a destination code that is not in the catalog', function () {
    $response = post('/playground/cruise', [
        'destinations' => ['not-a-real-place'],
        'tripStart' => now()->addDays(7)->toDateString(),
    ]);

    $response->assertSessionHasErrors(['destinations.0']);
});
