<?php

namespace App\Http\Controllers\Playground;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class HabitatController extends Controller
{
    /**
     * Render /playground/habitat, a new-style O'Neill Cylinder builder.
     */
    public function __invoke(): Response
    {
        return Inertia::render('playground/habitat', [
            'translations' => translations(['habitat', 'storyStage']),
        ]);
    }
}
