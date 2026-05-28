<?php

namespace App\Http\Controllers\Playground;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class SceneDebugController extends Controller
{
    /**
     * Render the MultiPlaneScene engine debug page.
     *
     * Phase 5 deliverable: visual verification surface for the engine,
     * built before any real scenes exist (Phase 7+). Uses Phase 2-lifted
     * background images as test layers. Survives into v1 as an unlisted
     * route at /playground/scene-debug; Phase 14 (Launch hygiene) can
     * remove it if desired.
     */
    public function __invoke(): Response
    {
        return Inertia::render('playground/scene-debug', [
            'translations' => translations(['playground']),
        ]);
    }
}
