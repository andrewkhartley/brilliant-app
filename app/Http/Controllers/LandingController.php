<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /**
     * Render the landing page.
     *
     * Composes the 7-section landing scaffold (Hero, CovidOrigin,
     * WhyInteractive, TryOne, WhatElse, ClosingScene, ContactFooter)
     * via the landing.tsx page entry. Sections start as stubs in P7.T1
     * and are replaced incrementally across P7.T2–T8.
     */
    public function __invoke(): Response
    {
        return Inertia::render('landing', [
            'translations' => translations(['landing']),
        ]);
    }
}
