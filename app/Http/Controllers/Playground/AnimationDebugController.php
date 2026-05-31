<?php

namespace App\Http\Controllers\Playground;

use App\Http\Controllers\Controller;
use App\Models\Experiences\Cruise\Destination;
use Inertia\Inertia;
use Inertia\Response;

class AnimationDebugController extends Controller
{
    /**
     * Temporary animation review surface.
     *
     * Lets us run full-screen experiences without submitting their
     * production forms. Remove this route/controller once the cruise
     * launch animation is tuned.
     */
    public function __invoke(): Response
    {
        $destinations = Destination::getCachedFacts()
            ->map(fn (Destination $destination): array => [
                'code' => $destination->destination_code,
                'name' => $destination->destination,
            ])
            ->values()
            ->all();

        return Inertia::render('playground/animation-debug', [
            'destinations' => $destinations,
            'translations' => translations(['cruise', 'playground']),
        ]);
    }
}
