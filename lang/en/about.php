<?php

/*
 * About page translations.
 *
 * Per-section subnamespaces:
 * - intro (P12.T2) — h1 + opening line + photo alt + placeholder label
 * - disney (P12.T2) — craft lineage chapter (3 paragraphs)
 * - covid (P12.T2) — 2020 pivot story (3 paragraphs)
 * - whatIMake (P12.T2) — Undaunted moment + Clubhouse origin +
 *   transparency-attribution thread (4 paragraphs + 1 transparency note)
 * - whyBrilliant (P12.T2) — synthesis / why this application (3 paragraphs)
 * - contact (P12.T2) — email CTA + LinkedIn link
 *
 * Copy is placeholder; Andrew refines over the weekend.
 */

return [
    'pageTitle' => 'About Andrew Hartley',
    'pageDescription' => 'The longer story — Disney chapter, Covid talks, Undaunted community, why Brilliant.',

    'intro' => [
        'heading' => 'Andrew Hartley',
        'opening' => 'Designer-engineer who treats math, animation, and engineering as the same craft. This page is the longer story — where it came from, what I make, and why Brilliant.',
        'photoAlt' => 'Portrait of Andrew Hartley',
        'photoPlaceholderLabel' => 'Portrait coming',
    ],

    'disney' => [
        'heading' => 'The Disney chapter',
        'paragraph1' => 'I spent years as a Disney Cast Member — the kind of role where craft is the substance of the job. Every detail of every guest interaction is designed, rehearsed, measured. The whole place is a working artifact of "make the idea feel like a place."',
        'paragraph2' => 'That environment teaches you to see the seams. The multi-plane camera, the moving walls of a dark ride, the dwell time between two musical cues — they\'re all the same kind of thing. Layers of work, calibrated to produce a feeling.',
        'paragraph3' => 'The sensibility followed me out. Every interactive piece I build asks the question Disney asks: what would it feel like to be inside this idea?',
    ],

    'covid' => [
        'heading' => 'The Covid talks',
        'paragraph1' => 'March 2020. Everything shut down. The Zoom invite for that first explanation talk had 47 people on it — friends, family, friends-of-friends — all wanting to understand what was happening with the same hunger and the same confusion.',
        'paragraph2' => 'I spent that night re-drawing the diagrams. The next morning, instead of telling them what was happening, I gave them the levers. Slide this number. Watch the curve respond. Try to break it. That talk landed differently than the explanation-mode talks I\'d given before.',
        'paragraph3' => 'A pattern surfaced over the next year: every time I let people *do* the math instead of *read about* the math, the conversation changed. The room got quieter, then louder. People asked second questions. That\'s the discovery this site is built around.',
    ],

    'whatIMake' => [
        'heading' => 'What I make',
        'paragraph1' => 'I\'ve been building Undaunted since early 2021. The name comes from the tagline — "those who are unafraid of rising to the challenges that face us." It\'s a community for the kind of people who want to do the work, not just read about it.',
        'paragraph2' => 'It started in Clubhouse rooms during the audio-social moment of the pandemic. I helped lead discussions in groups like Small Steps, Giant Leaps, sharing the stage with researchers, sci-fi authors, mission crews, and people pushing toward what comes next in space. The rooms taught me that the most interesting conversations happen when the people who think professionally about these questions get into the same room as the people who think curiously about them.',
        'paragraph3' => 'My particular curiosity in those rooms was megastructures in space — O\'Neill Cylinders, Stanford toruses, the whole question of "how do you build a place to live that isn\'t already there." That curiosity is why the Habitat experience on this site exists. The math behind 1g spin rates and cylinder surface area is the math I keep coming back to.',
        'paragraph4' => 'Undaunted is still small. It\'s the kind of thing I plan to keep building regardless. Sharing it here is partly to introduce the work and partly to invite people to imagine what it could grow into — if it found the right home.',
        'transparencyNote' => 'The physics powering Interstellar and Cruise on this site was originally built for Undaunted. Cited code retains original attribution; this site\'s commit history makes the lineage visible end-to-end.',
    ],

    'whyBrilliant' => [
        'heading' => 'Why Brilliant',
        'paragraph1' => 'Brilliant has built the rarest thing in education tech: a product where the *medium* carries the lesson. "Feel the math" isn\'t a tagline; it\'s an engineering principle. Every problem on Brilliant is shaped so that the only way through is to do the thinking, not read about someone else doing it.',
        'paragraph2' => 'I built this application as itself for the same reason. The argument is the artifact. I could have sent a CV and a portfolio link; instead I built the kind of thing I think Brilliant could grow toward — interactive math, multi-plane animation, a curiosity-driven community around the ideas.',
        'paragraph3' => 'If any of this resonates, I\'d love to talk about what it could become.',
    ],

    'contact' => [
        'heading' => 'Let\'s talk',
        'pitch' => 'If any of this rang true — whether it\'s the work, the trajectory, or just a question about how something was built — I\'m easy to reach.',
        'links' => [
            'email' => 'Email',
            'emailHref' => 'mailto:ahartley@gmail.com',
            'linkedin' => 'LinkedIn',
            'linkedinHref' => 'https://www.linkedin.com/in/andrewkhartley',
        ],
    ],
];
