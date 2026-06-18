<?php

/** @noinspection PhpUndefinedMethodInspection — `assertInertia` is a TestResponse macro registered by inertia-laravel. */

use function Pest\Laravel\get;

it('renders the resume page', function () {
    $response = get('/resume');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('resume'));
});

it('shares the resume translation namespace including the thesis', function () {
    $response = get('/resume');

    $response->assertInertia(
        fn ($page) => $page
            ->where('translations.resume.thesis.title', 'Everything here is true. The boring version was also true.')
            ->has('translations.resume.controls.handleLabel')
    );
});

it('ships the calibration-anchor honest lines', function () {
    $response = get('/resume');

    $response->assertInertia(
        fn ($page) => $page
            ->where(
                'translations.resume.lines.swingersLead.reconciliation.honest',
                'People spent half an hour every night chasing pennies in a spreadsheet. Now the computer finishes before they\'re done saying "reconciliation."',
            )
            ->has('translations.resume.lines.swingersLead.savings.corporate')
            ->has('translations.resume.sections.disney.company')
    );
});
