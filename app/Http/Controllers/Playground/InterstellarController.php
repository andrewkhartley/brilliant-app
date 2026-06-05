<?php

namespace App\Http\Controllers\Playground;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class InterstellarController extends Controller
{
    /**
     * Render /playground/interstellar — the relativity travel agency.
     *
     * Full Phase 8 deliverable. Form: destination + acceleration +
     * duration mode toggle. Result: dilation factor + dual clocks +
     * fuel-equivalent visualization + KaTeX equation card.
     *
     * Mode toggle: Beginner (sliders + plain language) vs Just the
     * math (equation card prominent).
     *
     * P8.T1 (this scaffold) ships the controller + route + page with
     * stub child components. P8.T2 adds 3 rocket equations to the
     * registry. P8.T3 promotes form + result stubs to real
     * interactive components. P8.T4 adds the mode toggle behavior +
     * fuel-equivalent visualization.
     */
    public function __invoke(): Response
    {
        return Inertia::render('playground/interstellar', [
            'translations' => translations(['interstellar', 'storyStage']),
        ]);
    }
}
