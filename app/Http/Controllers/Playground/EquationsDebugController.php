<?php

namespace App\Http\Controllers\Playground;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class EquationsDebugController extends Controller
{
    /**
     * Render /playground/equations-debug — the visible PHP-vs-TS parity
     * verification surface for the equation registry.
     *
     * Phase 8 Task 4.9 deliverable. Reads the parity fixture
     * (tests/fixtures/equations-parity.json) and passes it to the page
     * via Inertia props. The page then computes the same inputs via
     * the TS equation twins and renders a side-by-side comparison with
     * diff + pass/fail status per case.
     *
     * Browseable v1: fixed inputs from the fixture. User-adjustable
     * inputs (with live PHP via XHR) is a future enhancement.
     */
    public function __invoke(): Response
    {
        $fixturePath = base_path('tests/fixtures/equations-parity.json');
        $fixture = file_exists($fixturePath)
            ? json_decode(file_get_contents($fixturePath), true)
            : [];

        return Inertia::render('playground/equations-debug', [
            'fixture' => $fixture,
            'fixturePath' => 'tests/fixtures/equations-parity.json',
            'translations' => translations(['playground']),
        ]);
    }
}
