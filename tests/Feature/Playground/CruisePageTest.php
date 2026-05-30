<?php

/** @noinspection PhpUndefinedMethodInspection — `assertInertia` is a TestResponse macro registered by inertia-laravel; PHPStorm doesn't pick up runtime macros without the IDE helper plugin. */

use App\Models\Experiences\Cruise\Destination;
use Database\Seeders\SolarSystemFactsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\get;

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
