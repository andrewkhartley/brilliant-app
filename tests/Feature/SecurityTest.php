<?php

use Illuminate\Support\Facades\Route;

test('removed horizon query endpoint is not routable', function () {
    $response = $this->get('/api/horizon/query');

    $response->assertNotFound();
});

test('interstellar star search is rate limited', function () {
    $route = Route::getRoutes()->getByName('interstellar.stars.search');

    expect($route->gatherMiddleware())->toContain('throttle:30,1');
});

test('responses carry baseline security headers', function () {
    $response = $this->get(route('home'));

    $response->assertHeader('X-Frame-Options', 'DENY');
    $response->assertHeader('X-Content-Type-Options', 'nosniff');
    $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
});
