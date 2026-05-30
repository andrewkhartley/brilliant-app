<?php

use App\Models\Experiences\Cruise\Destination;
use Database\Seeders\SolarSystemFactsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\get;

uses(RefreshDatabase::class);

it('renders the cruise scaffold page with destinations from the database', function () {
    $this->seed(SolarSystemFactsSeeder::class);

    $response = get('/playground/cruise');

    $response->assertOk();
    expect(Destination::count())->toBe(11);
});
