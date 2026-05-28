<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class LandingController extends Controller
{
    /**
     * Render the landing page placeholder.
     *
     * v1: a minimal Brilliant placeholder rendered through AppLayout +
     * useTranslation, proving the i18n + a11y foundation works.
     * Phase 7 replaces this with the real landing page.
     */
    public function __invoke(): Response
    {
        return Inertia::render('welcome', [
            'translations' => translations(['landing']),
        ]);
    }
}
