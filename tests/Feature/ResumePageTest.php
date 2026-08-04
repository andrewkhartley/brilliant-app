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
            ->has('translations.resume.groups.projects')
            ->has('translations.resume.groups.experience')
            ->has('translations.resume.groups.earlier')
            ->has('translations.resume.sections.myco.tech')
            ->has('translations.resume.footer.privateRepos')
    );
});

it('ships a corporate and honest pair for every resume line', function () {
    // Structural check: each line id under each group resolves to both a
    // corporate and an honest string. Pins the data shape, not the prose.
    $groups = [
        'summary' => ['summary'],
        'skills' => ['languages', 'security', 'platform', 'integrations', 'ai'],
        'myco' => ['intro', 'protocol', 'integrity', 'server', 'hardening', 'proof', 'audit'],
        'alexandria' => ['intro', 'eav', 'llm', 'migration'],
        'signal' => ['intro'],
        'empoweredPublic' => ['intro'],
        'swingersLead' => ['intro', 'architecture', 'releases', 'reconciliation', 'azure', 'multivenue'],
        'swingersAnalyst' => ['automate', 'toast', 'businessCase'],
        'sodexo' => ['concierge'],
        'jetblue' => ['safety'],
        'disney' => ['helpDesk'],
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
