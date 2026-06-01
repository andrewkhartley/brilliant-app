<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;

class ProjectsController extends Controller
{
    /**
     * Render the projects page: a supporting surface for larger Andrew-built
     * projects that should not compete with the landing page cover letter.
     */
    public function __invoke(): Response
    {
        return Inertia::render('projects', [
            'translations' => translations(['projects']),
        ]);
    }
}
