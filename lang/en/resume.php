<?php

/*
 * Honest-version résumé strings.
 *
 * Page-specific namespace bundled by ResumeController via translations(['resume']).
 *
 * Structure:
 *  - thesis / controls / footer : page chrome
 *  - groups.<id>                : neutral group dividers (Selected Projects, etc.)
 *  - sections.<id>              : static headers (section title OR
 *                                 company/role/dates/location/tech)
 *  - lines.<groupId>.<lineId>   : { corporate, honest } pairs
 *
 * The corporate column mirrors the downloadable PDF (public/cv.pdf); the honest
 * column is the "how it feels inside" twin the page wipes between.
 */

return [
    'pageTitle' => 'Résumé (Honest Version)',

    'thesis' => [
        'kicker' => 'Résumé',
        'title' => 'Business-Friendly vs. Reality',
        'body' => 'Tired of that fake sounding language that adds bloat to resumes? Here are both sides: the left is what you\'re "supposed" to write. The right is how it feels inside.',
        'instruction' => 'Every section has its own handle: drag it to wipe that section between the two. Park it in the middle to watch them duel. Pew pew!',
    ],

    'controls' => [
        'handleLabel' => 'Wipe the :section section between the corporate and honest versions',
        'valueText' => ':corporate% corporate, :honest% honest',
        'corporateColumn' => 'Corporate',
        'honestColumn' => 'Honest',
    ],

    'footer' => [
        'cta' => 'Need the version engineered to survive an applicant tracking system? Here\'s the PDF. The robots prefer it.',
        'cvLinkText' => 'Download the corporate PDF',
        'privateRepos' => 'Code samples and private repositories are available on request. Myco, Alexandria, and Signal live in private repos: some of the work is personal, some is security-sensitive, and a few doors are better left closed until someone asks.',
    ],

    'groups' => [
        'projects' => 'Selected Projects',
        'experience' => 'Professional Experience',
        'earlier' => 'Earlier Career',
    ],

    'sections' => [
        'summary' => ['heading' => 'Summary'],
        'skills' => ['heading' => 'Technical Skills'],
        'myco' => [
            'company' => 'Myco Federation',
            'role' => 'Creator and Sole Developer · Active development',
            'dates' => 'Jul 2026 – Present',
            'tech' => 'Rust · libsignal · OpenMLS (RFC 9420) · axum · SQLite',
        ],
        'alexandria' => [
            'company' => 'Alexandria',
            'role' => 'Creator and Sole Developer · Working prototype',
            'dates' => '2021 – Present',
            'tech' => 'React · Laravel · EAV model · LLM integration',
        ],
        'signal' => [
            'company' => 'Signal Access Manager',
            'role' => 'Creator and Sole Developer · Piloted and limited deployment',
            'dates' => 'Jan 2026 – Mar 2026',
            'tech' => 'Signal protocol',
        ],
        'empoweredPublic' => [
            'company' => 'The Empowered Public',
            'role' => 'Creator and Sole Developer · Early development',
            'dates' => 'Jul 2026 – Present',
        ],
        'swingersLead' => [
            'company' => 'Swingers: Crazy Golf Club',
            'role' => 'Lead Platform Developer',
            'dates' => 'Apr 2025 – Apr 2026',
            'location' => 'New York, NY',
        ],
        'swingersAnalyst' => [
            'company' => 'Swingers: Crazy Golf Club',
            'role' => 'Application Support Analyst',
            'dates' => 'Mar 2022 – Apr 2025',
            'location' => 'New York, NY',
        ],
        'sodexo' => [
            'company' => 'Sodexo USA',
            'role' => 'Assistant Manager of Guest Services',
            'dates' => '2021',
        ],
        'jetblue' => [
            'company' => 'JetBlue Airways',
            'role' => 'Inflight Crewmember',
            'dates' => '2014 – 2021',
        ],
        'disney' => [
            'company' => 'Walt Disney World Resort',
            'role' => 'Trek Coordinator / Payroll Process Analyst / Guest Relations Trainer',
            'dates' => '2007 – 2014',
        ],
        'education' => ['heading' => 'Education'],
        'contact' => ['heading' => 'Open to relocating'],
    ],

    'lines' => [
        'summary' => [
            'summary' => [
                'corporate' => 'Full-stack developer who takes production platforms from architecture through deployment and operations. Sole designer of a multi-venue hospitality operations platform on Azure, now building an end-to-end encrypted federated messaging platform. The independent work runs on one vision: infrastructure that leaves communities in control of their own tools.',
                'honest' => 'I build software alone that companies usually need a whole team for. I\'m good with computers, and I know what needs the human touch versus the monotonous work best fit for machines.',
            ],
        ],
        'skills' => [
            'languages' => [
                'corporate' => 'PHP, Laravel, Livewire, JavaScript, TypeScript, React, Node.js, Rust, Python, MySQL, HTML/CSS.',
                'honest' => 'A few languages I picked up when it actually made sense to: does this make me a polyglot?',
            ],
            'security' => [
                'corporate' => 'MLS (RFC 9420), OpenMLS, libsignal, PQXDH, Double Ratchet, end-to-end encryption, threat modeling, adversarial and mutation testing.',
                'honest' => 'Cryptography with names that sound like a name a certain trillionaire would give to his child. What they actually mean: your messages stay yours, and with federation, you can prove it yourself!',
            ],
            'platform' => [
                'corporate' => 'Azure deployment and optimization, axum, SQLite, database design, systems architecture, multi-tenant platforms, REST API integration, CI/CD, Git.',
                'honest' => 'I can make systems that were never meant to speak to each other carry a convo. If only matchmaking were a viable career path...',
            ],
            'integrations' => [
                'corporate' => 'Toast POS, Easol, Embed, Viator, Signal protocol.',
                'honest' => 'Good software platforms that need a nudge to understand each other.',
            ],
            'ai' => [
                'corporate' => 'Claude Code and Codex for spec-driven implementation, test-guided generation, and iterative review, with architecture and design decisions owned directly.',
                'honest' => 'I use AI, but I try not to abuse it. I saw Terminator, and I know how that story can go.',
            ],
        ],
        'myco' => [
            'intro' => [
                'corporate' => 'Federated, end-to-end encrypted communications platform giving community organizers a secure, Discord-shaped structure. Phases 0 through 5 of a 10-phase roadmap complete in seven weeks: identity, direct messages, channels, and the server core all run and are demonstrated in full.',
                'honest' => 'A private, self-hostable Discord for people who organize and can\'t risk a company reading the room. Half the roadmap in several weeks.',
            ],
            'protocol' => [
                'corporate' => 'Built the protocol core in Rust on libsignal and OpenMLS: PQXDH and Double Ratchet for direct messages, MLS with client-signed membership for channels, and a purpose-built OpenMLS provider in place of the upstream test provider.',
                'honest' => 'The encryption plumbing, built on the same battle-tested pieces Signal uses, plus a part I had to build myself because the off-the-shelf one was only meant for tests.',
            ],
            'integrity' => [
                'corporate' => 'Made membership integrity a compile-time guarantee rather than a runtime check, so a forged commit is structurally unable to reach the step that merges it and a hostile server cannot add itself to a channel.',
                'honest' => 'I made it so a faked "let me into this channel" can\'t even physically reach the code that would approve it. Not "we check for that": the check can\'t be skipped, because the shape of the code won\'t allow it. A nosy server can\'t sneak itself in.',
            ],
            'server' => [
                'corporate' => 'Shipped the server core (registration, key directory, MLS delivery service, mailbox queues, WebSocket fan-out, epoch recovery) on storage-as-truth with per-entity linearizers, so the server sequences commits while holding no group keys.',
                'honest' => 'The server that shuttles everyone\'s messages around never actually holds the keys to read them. It keeps things in order without ever being trusted, which is the whole point.',
            ],
            'hardening' => [
                'corporate' => 'Hardened the unauthenticated surface before any deployment: per-source rate limiting, per-sender mailbox quotas, and fail-closed TLS startup that refuses to bind rather than fall back to plaintext.',
                'honest' => 'Before letting anyone near it, I assumed the internet is hostile: throttle the strangers, cap the mailboxes, and if encryption can\'t start up correctly, the whole thing refuses to run rather than quietly going naked.',
            ],
            'proof' => [
                'corporate' => 'Proved every security property by executable test, not code review: each defense is deliberately broken to confirm exactly the right guardian test fails. 94% line coverage on the kernel, 1,000-member channels measured end to end, and libsignal and OpenMLS each confined to one adapter module by a CI isolation check.',
                'honest' => 'For every "this is secure" claim, there\'s a test that deliberately breaks it to prove the alarm actually goes off. I trust a failing test a lot more than a confident sentence. 94% of the core is covered, and I stress-tested it up to a thousand people in one channel.',
            ],
            'audit' => [
                'corporate' => 'Audited the completed phases against Signal, Matrix, Wire, Mastodon, and Discord\'s production MLS deployment, plus the governing RFCs, before building the server on top of them.',
                'honest' => 'Before building the next floor, I read how Signal, Matrix, Wire, and even Discord did theirs, plus the actual specs. Standing on giants\' shoulders beats reinventing a worse wheel and calling it innovation.',
            ],
        ],
        'alexandria' => [
            'intro' => [
                'corporate' => 'Worldbuilding and creative structuring platform built around a problem no existing tool solves: how writers capture unstructured ideas as they arrive, then organize them as the world takes shape.',
                'honest' => 'I built a tool for writers who, like me, have a thousand ideas and nowhere to put them. It lets you dump the mess first, and it is way easier for the ideas to take hold here.',
            ],
            'eav' => [
                'corporate' => 'Architected the platform on an entity-attribute-value model so users define their own entity schemas instead of conforming to a fixed template, letting one system serve very different creative projects with no customization.',
                'honest' => 'Instead of forcing your world into my boxes, it lets you build your own boxes, and some people have weird boxes. Embrace the weird boxes!',
            ],
            'llm' => [
                'corporate' => 'Built an LLM integration layer that reads each user\'s custom schema at runtime and generates content conforming to that structure rather than producing generic output.',
                'honest' => 'The AI reads the world you\'ve already built and writes inside its rules, but in worldbuilding, not any script or final copy. Put all the beautiful context in front of you so your scenes are enriched.',
            ],
            'migration' => [
                'corporate' => 'Migrated the frontend to React on a production-scale codebase to work directly with modern patterns.',
                'honest' => 'I rebuilt the whole front end in React because the old approach hit a wall and I won\'t let sunk cost fallacies dictate my life!',
            ],
        ],
        'signal' => [
            'intro' => [
                'corporate' => 'Secure communications and room automation for community rapid-response networks, built on Signal\'s open-source infrastructure. Ten phases and 2,000+ tests, concept to live pilot in eight weeks, with certificate-based verification, ZIP code adjacency alerting for geo-aware coordination, and silent emergency modes for high-risk scenarios.',
                'honest' => 'The dry run for Myco: a secure way for community groups to organize, prove who they are, and hear when something is happening near them. There is even a mode that quietly plays dumb if someone is forcing you to open the app. I hope nobody ever needs that one.',
            ],
        ],
        'empoweredPublic' => [
            'intro' => [
                'corporate' => 'Toolkit that helps residents prepare for town hall meetings on data center development, replacing grandstanding with direct questions that demand direct answers on resource stewardship and promised jobs.',
                'honest' => 'Ever watched someone burn their three minutes at a town hall on a speech instead of the one question that actually pins the answer down? This helps regular people walk in with the sharp question, not the ramble. Currently aimed at the data centers quietly eating local water and power.',
            ],
        ],
        'swingersLead' => [
            'intro' => [
                'corporate' => 'Sole developer of the Swingers Hub, a full-stack internal platform replacing fragmented Excel-based operations across multiple hospitality venues.',
                'honest' => 'I replaced a pile of haunted spreadsheets with one system that actually knew what was going on. By myself. Across multiple venues. Then someone else takes credit higher up the chain for approving it. Thanks, corporate America.',
            ],
            'architecture' => [
                'corporate' => 'Architected and deployed a Laravel/Livewire platform on Azure with 106 database tables, 211 routes, and 61 reusable service classes, integrating Toast, Easol, Embed, and Viator for real-time operational data.',
                'honest' => 'What is life without a few statistics to throw onto a presentation slide as a measure of success? I prefer the comments from people using it, but alas, the PowerPoint gods must be appeased.',
            ],
            'releases' => [
                'corporate' => 'Shipped 53 production releases and 1,100+ commits solo, delivering in eight months a Phase 1 scope estimated at 12 to 18 months for a four-to-six-person team.',
                'honest' => 'I did the work of the 4-to-6 person team that wasn\'t in the budget to hire. The dev team was just me and a couple of dogs who contributed in cuddles.',
            ],
            'reconciliation' => [
                'corporate' => 'Cut discrepancy research from 30–60 minutes to under 5 minutes, and nightly cash reconciliation by 20–30 minutes per venue, by replacing manual Excel workflows with automated API-driven pipelines.',
                'honest' => 'Typos in the old spreadsheet or in Toast did not connect well, especially at the end of a long day. Eliminating that time was the biggest first win after deployment.',
            ],
            'azure' => [
                'corporate' => 'Separated queue and notification logic into independent deployments to hold reliability on a cost-efficient resource tier.',
                'honest' => 'I split the app so the part that sends notifications couldn\'t take down the part that lets people log in: asynchronicity in motion, baby!',
            ],
            'multivenue' => [
                'corporate' => 'Designed multi-venue architecture that onboarded a new location with zero additional custom development, validating franchising readiness.',
                'honest' => 'When they opened a new location, it just worked. Design with the automations from the start and repetition doesn\'t have a chance to take hold.',
            ],
        ],
        'swingersAnalyst' => [
            'automate' => [
                'corporate' => 'Automated operational data extraction, reducing hourly processing time from 12 minutes to 30 seconds.',
                'honest' => 'A job that ate 12 minutes every hour now takes 30 seconds. Do that math across a year and tell me KPIs are the point.',
            ],
            'toast' => [
                'corporate' => 'Led first systemic improvements to Toast POS configuration, standardizing workflows and reducing errors across venues.',
                'honest' => 'I was the first person to look at our POS setup and ask why every venue did it differently. Luckily, that was the job I was hired to fix.',
            ],
            'businessCase' => [
                'corporate' => 'Made the business case for a central internal platform during the Easol onboarding, leading to the Hub initiative.',
                'honest' => 'I stood up in a meeting and argued for building the whole platform. It was a Teams meeting, so it wasn\'t nearly as dramatic. I was probably on mute, too.',
            ],
        ],
        'sodexo' => [
            'concierge' => [
                'corporate' => 'Founded the 8 West Concierge Program for VIP clientele and launched the Lobby Concierge Program, consolidating service functions under one department during a hiring freeze.',
                'honest' => 'During a hiring freeze, I helped lay the groundwork for an extension at a hospital. Covid made sure the project took a lot longer to pan out, but at least I got it started!',
            ],
        ],
        'jetblue' => [
            'safety' => [
                'corporate' => 'Departmental safety champion for two years, representing inflight on enterprise-wide safety committees during major operational changes.',
                'honest' => 'For two years I was the person crewmembers trusted to carry "this isn\'t safe" up to the people who could fix it. No funny quips here: this kind of work was actually meaningful.',
            ],
        ],
        'disney' => [
            'helpDesk' => [
                'corporate' => 'Established the Coordinator Help Desk at Disney\'s Animal Kingdom, the central call center for guest impacts and resolutions, saving over 25,000 labor hours annually through optimized rotations and metrics.',
                'honest' => 'I built the place everyone called when a guest\'s day was going sideways, and ran it well enough to give back 25,000 hours a year. Our overtime was insane before this, and as nice as the paychecks were, the quality of life most certainly was not.',
            ],
        ],
        'education' => [
            'degrees' => [
                'corporate' => 'B.S. Business Administration, Northwood University (3+1 Program), 2005–2008. Associate in Business Studies, Delta College (3+1 Program), 2005–2008.',
                'honest' => 'I studied business, then did nothing with the degree. The irony of where that eventually led me is not lost on me.',
            ],
        ],
        'contact' => [
            'relocation' => [
                'corporate' => 'Open to remote work and relocation to CA, OR, or WA.',
                'honest' => 'I will move across the country for people who don\'t make me write sentences like the one on the left. I mean, I\'ll do it for the other side, but if you made it this far, let\'s stay on the cool side.',
            ],
        ],
    ],
];
