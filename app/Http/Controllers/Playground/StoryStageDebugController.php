<?php

namespace App\Http\Controllers\Playground;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class StoryStageDebugController extends Controller
{
    /**
     * Render a reusable full-screen story-stage engine test surface.
     */
    public function __invoke(): Response
    {
        return Inertia::render('playground/story-stage-debug', [
            'translations' => translations(['storyStage']),
        ]);
    }
}
