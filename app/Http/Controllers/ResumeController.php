<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ResumeController extends Controller
{
    /**
     * Render /resume — the honest-version résumé. Every descriptive line
     * carries a corporate + honest pair; the page wipes between them. All
     * strings live in the `resume` translation namespace.
     */
    public function __invoke(): Response
    {
        return Inertia::render('resume', [
            'translations' => translations(['resume']),
        ]);
    }
}
