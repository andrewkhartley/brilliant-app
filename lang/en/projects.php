<?php

/*
 * Projects page translations.
 *
 * Ordering mirrors the page top-to-bottom: intro, the "Empower & protect"
 * mission trio (Myco, SAM, Empowered Public), the flagship builds (Swingers,
 * Alexandria), then Undaunted + references. Shared image-viewer nav labels
 * live under `gallery`.
 */

return [
    'pageTitle' => 'Projects',
    'heading' => 'What is on my radar?',
    'intro' => 'This is a mix of what I\'m building now and where I want to take it. Some of it helps curious people think more clearly. Some of it hands communities the keys to tools they\'d otherwise be renting from a company that could change its mind next quarter. All of it is production, not prototypes, and I built most of it alone (which is either the selling point or the warning, depending on who\'s reading).',
    'introBio' => 'Before I wrote software full time, I spent two decades in frontline operations at Disney, JetBlue, Sodexo, and Swingers (Crazy Golf, not the other). That is where the operational empathy comes from: I have been the person doing the manual reconciliation support at 2 a.m., so when I build the tool that replaces it, I know what actually needs to work.',

    'publicGood' => [
        'kicker' => 'Empower & protect',
        'heading' => 'Three builds for a safer, more empowered public.',
        'intro' => 'Different problems, one instinct: give people tools that protect them and hand them the keys. Two keep a community\'s conversations its own; one helps the public walk into the room prepared. Where the work is security-sensitive, the details are more need-to-know. What to know? You know what to do...',
        'cards' => [
            'myco' => [
                'badge' => 'Restricted · In development',
                'title' => 'Myco Federation',
                'tagline' => 'Discord\'s shape, without renting your community.',
                'body' => 'End-to-end encrypted, federated chat that lets a community own its own space instead of renting it from a company that can read every message. You can run the server, and everything in transit remains encrypted. Built solo and in active development.',
                'footer' => 'Case study available on request',
            ],
            'sam' => [
                'badge' => 'Restricted · Piloted',
                'title' => 'Signal Access Manager',
                'tagline' => 'Secure coordination for rapid-response networks.',
                'body' => 'A certificate-based secure communications platform built on Signal\'s infrastructure for community organizing networks. Concept to an active pilot in two months. SAM is where the Myco instinct started.',
                'footer' => 'Case study available on request',
            ],
            'empoweredPublic' => [
                'badge' => 'In active development',
                'title' => 'The Empowered Public',
                'tagline' => 'Help the public show up and be heard.',
                'body' => 'A civic toolkit that helps residents show up prepared for local government meetings, starting with the data centers quietly moving into their towns: a reviewed question library, a Town Hall Mode that hands you one sharp question at a time, and public-records request templates.',
                'footer' => 'Developed in a few days: building the careful part first, an editorial and evidence pipeline that ties every published claim to verified sources.',
            ],
        ],
    ],

    'swingers' => [
        'kicker' => 'The Swingers Hub · 2025–2026',
        'heading' => 'One platform to replace a pile of haunted spreadsheets.',
        'intro' => 'A team-scale internal operations platform I shipped solo, replacing fragmented Excel workflows across multiple hospitality venues.',
        'bodyA' => 'Operations across venues ran on disconnected spreadsheets, manual reconciliation, and siloed data from four external platforms. I made the case for one unified system, then designed and shipped it as the sole developer over eight months.',
        'bodyB' => 'The Hub is a Laravel platform with 106 database tables, 211 routes, and live integrations across Toast, Easol, Embed, and Viator, running on Azure with a CI/CD pipeline I built alongside it. When a new venue came online, it onboarded with zero custom development.',
        'bodyC' => 'What made it work was not just the architecture. I had spent three years inside the operation before I started building, so I knew the workflows because I had done them, and the people using it had real influence on how it took shape.',
        'tech' => 'Laravel · Livewire · MySQL · Azure · Toast / Easol / Embed / Viator APIs · CI/CD',
        'features' => [
            'reconciliation' => [
                'title' => 'Reconciliation, automated',
                'body' => 'Nightly cash-up went from yellow-cell Excel entry to automated variance detection. Discrepancy research dropped from 30–60 minutes to under 5.',
            ],
            'multivenue' => [
                'title' => 'Multi-venue from day one',
                'body' => 'Designed multi-tenant from the start, so a brand-new location onboarded with zero custom development.',
            ],
            'realtime' => [
                'title' => 'Live, not nightly',
                'body' => 'Check-in, cash-up, and venue performance pull from Toast in real time. No nightly export, no stale numbers.',
            ],
        ],
        'screenshots' => [
            'excelCashup' => [
                'title' => 'Before: the spreadsheet',
                'alt' => 'The old Excel cash-up workflow with yellow-cell manual entry and a row of sheet tabs.',
                'caption' => 'The old nightly cash-up: yellow-cell manual entry spread across a dozen fragile sheet tabs.',
            ],
            'reconciliation' => [
                'title' => 'After: automated reconciliation',
                'alt' => 'Hub Final Reconciliation Summary with variance detection and a cash-management panel.',
                'caption' => 'What replaced it: automated variance detection. Discrepancy research went from 30–60 minutes to under 5.',
            ],
            'calendar' => [
                'title' => 'Custom calendar',
                'alt' => 'Hub calendar showing a month of time slots per day with a Day at a Glance panel.',
                'caption' => 'Event tracking scoped per business unit, so each department sees only what is relevant to it.',
            ],
            'cashupEasol' => [
                'title' => 'Auto-mapped integrations',
                'alt' => 'Hub Cash Up page showing Upload Easol Data with bookings synced and a progress indicator.',
                'caption' => 'New items in Easol map themselves into the Hub as they appear. No manual reconciliation step.',
            ],
            'staffBanks' => [
                'title' => 'Live Toast integration',
                'alt' => 'Close Staff Banks view with live Toast data: employee deposits, declared tips, and differences.',
                'caption' => 'Closing staff banks against live Toast data: deposits, declared tips, and differences in one view.',
            ],
            'sop' => [
                'title' => 'In-line SOPs',
                'alt' => 'In-app SOP modal walking through variance investigation steps in context.',
                'caption' => 'Context-specific instructions surface where the user is stuck, instead of a doc nobody reads in the moment.',
            ],
        ],
    ],

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
            'activeLearning' => [
                'title' => 'Active learning',
                'body' => 'The best learning platforms already understand that people learn by doing. This application is my way of showing how story, community, and engineering can push that instinct into bigger worlds.',
            ],
        ],
    ],

    'gallery' => [
        'close' => 'Close image viewer',
        'previous' => 'Previous image',
        'next' => 'Next image',
        'position' => ':current of :total',
    ],

    'note' => 'The connection is straightforward: I want to contribute to something I believe in, and keeping curiosity alive together will make for a more meaningful tomorrow.',
];
