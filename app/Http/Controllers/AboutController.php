<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class AboutController extends Controller
{
    /**
     * Render the /about page — the deep-personal-story surface that
     * pairs with the landing. Where the landing is a TASTE, About is
     * the MEAL.
     *
     * Phase 12 deliverable. The page composes 6 section components:
     * Intro, Disney chapter, Covid talks, What I make (Undaunted),
     * Why Brilliant, Contact. v1 ships placeholder copy; Andrew
     * refines the copy over the weekend.
     */
    public function __invoke(): Response
    {
        return Inertia::render('about', [
            'translations' => translations(['about']),
        ]);
    }
}
