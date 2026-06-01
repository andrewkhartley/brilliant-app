<?php

/*
 * Landing page translations — populated incrementally across Phase 7.
 *
 * Per-task subnamespaces:
 * - hero (P7.T2) — title + tagline + multi-plane scene labels + captions
 * - covidOrigin (P7.T3) — opening prose + multi-plane scene labels + captions
 * - whyInteractive (P7.T4) — philosophy prose (3 paragraphs)
 * - tryOne (P7.T5) — inline Interstellar demo copy
 * - whatElse (P7.T6) — ExperienceCard text for Cruise + Habitat
 * - closingScene (P7.T7) — final multi-plane scene labels + captions
 * - contactFooter (P7.T8) — page-specific CTA + contact links
 *
 * P7.T1 (this scaffold) seeds each subnamespace with placeholderTitle +
 * placeholderNote keys; subsequent tasks replace those with real section
 * content.
 */

return [
    'pageTitle' => 'Andrew Hartley — Brilliant application',
    'pageDescription' => 'Multi-plane scenes + interactive equations + the craft behind the application.',

    'hero' => [
        'title' => 'Take the math, and make it move.',
        'titleLine1' => 'Take the math,',
        'titleLine2' => 'and make it move.',
        'subtitle' => 'For the people who learn by taking apart the world',
        'pitchPrefix' => 'A job history says where I have been. This is the story of what I want to do:',
        'pitchEmphasis' => 'find my people',
        'pitchSecond' => 'build interactive learning for the curiosity-driven',
        'pitchThird' => 'help people find their spark in a fascinating and sometimes uncertain world',
        'layers' => [
            'sky' => 'Deep-space sky',
            'distantNebula' => 'Distant nebula',
            'nearNebula' => 'Near nebula veil',
            'horizon' => 'Planetary horizon',
            'rail' => 'Observation rail',
        ],
    ],

    'covidOrigin' => [
        'kicker' => 'Clubhouse',
        'heading' => 'Small steps, giant rooms',
        'intro' => 'A strange season of chaos became the place I learned how much curiosity can move through a room.',
        'story' => [
            'kicker' => 'Small Steps & Giant Leaps',
            'heading' => 'The rooms became laboratories for wonder.',
            'paragraph1' => 'A few years back, something happened that caused a bit of chaos. I was working with an airline, so I disappeared for a while. When I came back up for air, Clubhouse was waiting.',
            'paragraph2' => 'One group stuck out: Small Steps & Giant Leaps. After lurking for a few days, I started joining conversations about what humans might be capable of if we made a few decisions better.',
            'paragraph3' => 'That led to becoming one of the group leaders, helping shape rooms around curiosity, stage energy, and small interactive websites that could accompany the discussion.',
            'paragraph4' => 'Community came first, but tools gave people a reason to keep returning. My part became a mix of facilitation, room design, and companion builds: creating the conditions where curious people could stay with an idea long enough for it to become shared.',
        ],
        'capstone' => [
            'kicker' => 'What it taught me',
            'heading' => 'Inspiration should feel like participation.',
            'paragraph1' => 'The best rooms did not just explain big ideas. They gave people a way into them: a question, a model, a sketch, a small interactive artifact that made the conversation easier to enter and harder to leave.',
            'paragraph2' => 'That is the thread I see in Brilliant\'s "feel the math" approach and in the old multi-plane camera idea: layers, motion, and direct cause-and-effect can make an abstract idea feel like a place. Clubhouse taught me the community side of that pattern; this site is me building toward the tools side.',
        ],
        'rooms' => [
            'mars' => 'How to Build a City on Mars',
            'jamesWebb' => 'James Webb Space Telescope inauguration',
            'generationShip' => 'Designing a Generation Ship',
        ],
        'visual' => [
            'placeholderLabel' => 'Room performance',
            'status' => 'Archive screenshots',
            'roomLabel' => 'Room',
            'analyticsAlt' => 'Archived Clubhouse analytics chart showing room growth over time.',
            'marsAlt' => 'Archived Clubhouse room screenshot for How to Build a City on Mars.',
            'jamesWebbAlt' => 'Archived Clubhouse room screenshot for the James Webb Space Telescope inauguration.',
            'generationShipAlt' => 'Archived Clubhouse room screenshot for Designing a Generation Ship.',
        ],
        'gallery' => [
            'close' => 'Close gallery',
            'previous' => 'Previous image',
            'next' => 'Next image',
            'position' => ':current of :total',
            'analytics' => [
                'title' => 'Room growth over time',
                'caption' => 'An archived performance chart from the Clubhouse era. The final crop can focus this around the growth line and remove browser chrome.',
            ],
            'mars' => [
                'title' => 'How to Build a City on Mars',
                'caption' => 'One of the recurring space-settlement rooms from Small Steps & Giant Leaps, where the premise was big but the invitation was practical: think it through together.',
            ],
            'jamesWebb' => [
                'title' => 'A 12,000-listener James Webb room',
                'caption' => 'This was one of the rooms I led: a James Webb Space Telescope inauguration conversation that reached more than 12,000 listeners live. The iOS chrome stays because it feels like the artifact it is.',
            ],
            'generationShip' => [
                'title' => 'Designing a Generation Ship',
                'caption' => 'This room included one of the small companion pages I liked building alongside discussions: a quick interactive artifact people could open while the room unfolded.',
                'linkLabel' => 'Open the archived companion page',
                'linkHref' => 'https://web.archive.org/web/20211102133600/https://andrewkhartley.com/generation/',
            ],
        ],
        'layers' => [
            'lectureHall' => 'Clubhouse room backdrop',
            'seats' => 'Audience glow',
            'slideDeck' => 'Interactive companion',
        ],
        'caption' => [
            'opening' => 'Clubhouse turned a strange season into a room full of curious people.',
            'midReveal' => 'The best rooms did not lecture. They invited people on stage to think out loud.',
            'close' => 'That pattern stuck: explain the idea, then build something people can touch.',
        ],
    ],

    'whyInteractive' => [
        'heading' => 'Why interactive',
        'feelTheMath' => 'Brilliant calls it "feel the math." A problem isn\'t something you read about — it\'s something you can pull on, push back from, watch respond. That direct sense of cause and effect is the difference between knowing-about and knowing.',
        'multiPlaneCamera' => 'Disney called it the multi-plane camera, 1937. Layers of glass at different depths, photographed through a vertical column. When the camera moved, parallax did the rest — depth and atmosphere emerging from flat paint.',
        'synthesis' => 'Both inventions answer the same question: how do you make an idea feel like a place? This site is one application of that question to math, animation, and engineering — built as the cover letter for a Brilliant role.',
    ],

    'tryOne' => [
        'heading' => 'Try one yourself',
        'intro' => 'The full Interstellar travel agency lives at /playground/interstellar. Here\'s a taste — drag the slider to set a constant proper acceleration sustained for one year of coordinate time, and watch the relativistic speed approach the speed of light.',
        'sliderLabel' => 'Acceleration',
        'resultLabel' => 'Peak velocity:',
        'fullLink' => 'Open the full Interstellar experience →',
    ],

    'whatElse' => [
        'heading' => 'What else I built',
        'intro' => 'Two more experiences in the playground — built on the same engine and equation registry.',
        'undauntedLogoAlt' => 'Undaunted',
        'cards' => [
            'cruise' => [
                'title' => 'Sol Cruise',
                'description' => 'Planet-hopping trip builder with live NASA Horizons data. Pick destinations, pick a profile, get the relativistic itinerary.',
            ],
            'habitat' => [
                'title' => 'Habitat',
                'description' => 'O\'Neill Cylinder interior with the multi-plane camera as a shadowbox window. Interactive sliders for radius, length → 1g spin rate, surface area, population at given density.',
            ],
        ],
    ],

    'closingScene' => [
        'heading' => 'Closing scene',
        'layers' => [
            'cylinderHorizon' => 'O\'Neill cylinder curved horizon placeholder',
            'sunLine' => 'Dawn sun-line atmospheric haze placeholder',
            'frame' => 'Cylinder structural frame placeholder',
        ],
        'caption' => [
            'opening' => 'Dawn inside an O\'Neill Cylinder. The sun-line catches the curved horizon.',
            'midReflection' => 'A place — not a problem, not a chart. Made of geometry, paint, and patience.',
            'close' => 'Brilliant\'s craft. Disney\'s craft. The same answer to "how do you make an idea feel like a place?"',
        ],
    ],

    'contactFooter' => [
        'heading' => 'Let\'s talk',
        'pitch' => 'I built this site as my application for a role at Brilliant. If you\'d like to chat about it, or about anything else — I\'m easy to reach.',
        'links' => [
            'email' => 'Email',
            'emailHref' => 'mailto:ahartley@gmail.com',
            'github' => 'GitHub',
            'githubHref' => 'https://github.com/andrewkhartley/brilliant-app',
            'linkedin' => 'LinkedIn',
            'linkedinHref' => 'https://www.linkedin.com/in/andrewkhartley',
            'cv' => 'CV (PDF)',
            'cvHref' => '/cv.pdf',
        ],
    ],
];
