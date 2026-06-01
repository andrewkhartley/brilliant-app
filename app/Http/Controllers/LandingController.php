<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /**
     * Render the Phase 7 application narrative.
     */
    public function __invoke(): Response
    {
        return Inertia::render('landing', [
            'translations' => translations(['landing', 'playground']),
        ]);
    }
}
