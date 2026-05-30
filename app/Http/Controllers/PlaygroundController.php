<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class PlaygroundController extends Controller
{
    /**
     * Render the /playground hub page — entry point for the three
     * playground experiences (Interstellar, Cruise, Habitat).
     *
     * Phase 9 deliverable. The hub composes three ExperienceCards
     * pointing to the experience subroutes. Those subroutes 404 until
     * their respective phases (8, 10, 11) ship; the hub's job is to
     * exist and route correctly.
     */
    public function __invoke(): Response
    {
        return Inertia::render('playground/index', [
            'translations' => translations(['playground']),
        ]);
    }
}
