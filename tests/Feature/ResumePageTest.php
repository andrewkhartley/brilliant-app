<?php

/** @noinspection PhpUndefinedMethodInspection — `assertInertia` is a TestResponse macro registered by inertia-laravel. */

use function Pest\Laravel\get;

it('renders the resume page', function () {
    $response = get('/resume');

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->component('resume'));
});

it('shares the resume translation namespace chrome', function () {
    // Assert the chrome keys exist, not their exact copy — the wording is
    // authored content that changes freely and should not break tests.
    $response = get('/resume');

    $response->assertInertia(
        fn ($page) => $page
            ->has('translations.resume.thesis.title')
            ->has('translations.resume.thesis.body')
            ->has('translations.resume.controls.handleLabel')
            ->has('translations.resume.controls.valueText')
    );
});

it('ships a corporate and honest pair for every resume line', function () {
    // Structural check: each line id under each group resolves to both a
    // corporate and an honest string. Pins the data shape, not the prose.
    $groups = [
        'summary' => ['summary'],
        'skills' => ['languages', 'systems', 'ai', 'integrations', 'additional'],
        'alexandria' => ['intro', 'eav', 'llm', 'migration', 'capture'],
        'signal' => ['intro', 'auth', 'zip', 'decoy', 'myco'],
        'swingersLead' => ['intro', 'savings', 'architecture', 'releases', 'reconciliation', 'azure', 'multivenue'],
        'swingersAnalyst' => ['intro', 'automate', 'toast', 'golfDiary', 'businessCase'],
        'sodexo' => ['concierge'],
        'jetblue' => ['safety'],
        'disney' => ['helpDesk', 'pmSystem'],
        'education' => ['degrees'],
        'contact' => ['relocation'],
    ];

    $response = get('/resume');

    $response->assertInertia(function ($page) use ($groups) {
        foreach ($groups as $group => $lineIds) {
            foreach ($lineIds as $lineId) {
                $page
                    ->has("translations.resume.lines.{$group}.{$lineId}.corporate")
                    ->has("translations.resume.lines.{$group}.{$lineId}.honest");
            }
        }

        return $page;
    });
});
