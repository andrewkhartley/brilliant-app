<?php

namespace App\Http\Controllers\Playground;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ComponentsDebugController extends Controller
{
    /**
     * Render the Phase 6 shared-UI-components debug page.
     *
     * Phase 6 deliverable: visible verification surface for each component
     * (Nav, Footer, EquationCard, SliderInput, LiveResult [T5],
     * ExperienceCard [T6]). Sections will be added incrementally as each
     * component ships. Survives into v1 as an unlisted route at
     * /playground/components-debug; Phase 14 (Launch hygiene) can remove
     * it if desired.
     */
    public function __invoke(): Response
    {
        return Inertia::render('playground/components-debug', [
            'translations' => translations(['playground']),
        ]);
    }
}
