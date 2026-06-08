<?php

/*
 * Projects page translations.
 *
 * This page is a supporting surface for Andrew's broader project ecosystem.
 * The landing page can link here without carrying the full Alexandria or
 * Undaunted story inside the cover letter.
 */

return [
    'pageTitle' => 'Projects',
    'heading' => 'What is on my radar?',
    'intro' => 'I want to show a bit of what I\'m working on so that you can see where I intend to go. How do we use technology to help curious people think more clearly, organize what matters, and turn inspiration into something they can build with other people?',
    'alexandria' => [
        'kicker' => 'Alexandria',
        'heading' => 'Capture first. Organize later.',
        'intro' => 'Alexandria is a worldbuilding and creative structuring platform for writers, built around the most important writing impulse: ideas will come at any moment and then they\'re gone. It\'s your job to capture it before it disappears. Stephen King certainly felt that way in On Writing.',
        'bookTitle' => 'On Writing',
        'bodyA' => 'I needed something that started at the idea and could route it to whatever structure the writer needs. Alexandria lets writers and worldbuilders capture unstructured ideas as they arrive, then progressively organize them as the underlying world takes shape.',
        'bodyB' => 'The system is built on user-defined schemas, so the tool adapts to the work and enriches the way the data is navigated. Its AI layer reads each user\'s structure before proposing content, which uses tech to assist while protecting the integrity of someone\'s voice.',
        'bodyC' => 'Be smart with technology while staying human. Do not replace creative judgment. Build an environment that gives you more power over your own ideas.',
        'features' => [
            'schema' => [
                'title' => 'User-defined structure',
                'body' => 'Entity types, attributes, relationships, timeline views, graph views, and notes can all be shaped around a custom project.',
            ],
            'capture' => [
                'title' => 'Capture before sorting',
                'body' => 'Notes can land messy, then move through routing and review when the structure is sound.',
            ],
            'ai' => [
                'title' => 'AI with approval gates',
                'body' => 'The model can propose classifications, entries, and relationships, and the human decides what to keep.',
            ],
        ],
        'screenshots' => [
            'landing' => [
                'title' => 'Public landing',
                'alt' => 'Alexandria public landing page.',
                'caption' => 'The public face of the project.',
            ],
            'blueprints' => [
                'title' => 'Blueprints',
                'alt' => 'Alexandria blueprint dashboard showing user-defined project structures.',
                'caption' => 'User-defined structures let the same core system serve different projects without forcing a fixed template.',
            ],
            'notes' => [
                'title' => 'Notes and routing',
                'alt' => 'Alexandria notes and routing workspace.',
                'caption' => 'The capture-first workflow: ideas can be written however messy they are: route it somewhere so it\'s where you need it when you come back.',
            ],
            'aiReview' => [
                'title' => 'AI review',
                'alt' => 'Alexandria AI review modal with approval controls.',
                'caption' => 'AI can propose structure, with an approval process. With more detail, the richer the worlds become.',
            ],
            'close' => 'Close image viewer',
            'previous' => 'Previous image',
            'next' => 'Next image',
            'position' => ':current of :total',
        ],
    ],
    'undaunted' => [
        'kicker' => 'Undaunted',
        'heading' => 'A community for dreamers who want the future to feel buildable.',
        'intro' => 'Undaunted is the broader community idea sitting behind the space, science, and near-future work in this application: illuminate science through storytelling, then give the curious among us a unique place to call home.',
        'bodyA' => 'The foundation is a community rallied around ethical progress. The playgrounds here are small versions of that instinct: tools that are fun enough to invite curiosity, but grounded enough to take the math from practical to exploring what we need to press forward. A habitat calculator, a solar-system itinerary, or an interstellar route planner can become more than a form if the scenario gives people a reason to care. We all need some hope',
        'bodyB' => 'The longer arc is about prompts, interactive experiences, creative challenges, and stories that help young people imagine futures they might one day help build. If someone can picture a rotating habitat, a supply chain in space, or a route through moving worlds, the next question becomes: what would I need to learn to make any part of this real?',
        'bodyC' => 'That is why this application is a proof of my direction. I want to build experiences that transform science fiction into reality one imagination at a time, then give a community of dreamers something meaningful to do with that spark. There\'s something else that\'s pretty incredible that may be possible, but that is another conversation.',
        'links' => [
            'habitat' => [
                'title' => 'Habitat',
                'body' => 'Rotating-world design, land area, spin gravity, and life inside the drum.',
            ],
            'cruise' => [
                'title' => 'Sol Cruise',
                'body' => 'A solar-system travel planner powered by live NASA Horizons data.',
            ],
            'interstellar' => [
                'title' => 'Interstellar',
                'body' => 'Relativity, travel time, fuel constraints, and impossible destinations made legible.',
            ],
        ],
    ],
    'references' => [
        'kicker' => 'Reference points',
        'heading' => 'Where this fits',
        'intro' => 'When I picture what this could become, I think about how people responded in those Clubhouse rooms years ago. I am thinking about the places where future-facing science communication, explorable explanations, and active problem-solving can be united in a community.',
        'cards' => [
            'futureSystems' => [
                'title' => 'Future systems thinking',
                'body' => 'Work in the orbit of people like Isaac Arthur makes huge premises feel surprisingly practical: habitats, supply chains, starships, megastructures, and the long chain of problems to solve and remove the fiction from science fiction.',
            ],
            'explorableExplanations' => [
                'title' => 'Explorable explanations',
                'body' => 'The best interactive demos do more than visualize an answer. They let someone change the model, constraints, and engage in the full range of possibilities of the model.',
            ],
            'brilliant' => [
                'title' => 'Brilliant\'s active learning',
                'body' => 'Brilliant already understands that people learn by doing. This application is my way of showing how story, community, and engineering can push that instinct into bigger worlds.',
            ],
        ],
    ],
    'note' => 'For Brilliant, the connection is straightforward: I would love to contribute to something I believe in, and keeping curiosity alive together will make for a more meaningful tomorrow.',
];
