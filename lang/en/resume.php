<?php

/*
 * Honest-version résumé strings.
 *
 * Page-specific namespace bundled by ResumeController via translations(['resume']).
 *
 * Structure:
 *  - thesis / controls / footer : page chrome
 *  - sections.<id>              : static headers (section title OR company/role/dates/location)
 *  - lines.<groupId>.<lineId>   : { corporate, honest } pairs (added in Task 4)
 */

return [
    'pageTitle' => 'Résumé (Honest Version)',

    'thesis' => [
        'kicker' => 'Résumé',
        'title' => 'Business-Friendly vs. Reality',
        'body' => 'Tired of that fake sounding language that add bloat to resumes? Here are both sides: the left is what you\'re "supposed" to write. The right is how it feels inside.',
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
    ],

    'sections' => [
        'summary' => ['heading' => 'Summary'],
        'skills' => ['heading' => 'Technical Skills'],
        'alexandria' => [
            'company' => 'Alexandria',
            'role' => 'Creator and Sole Developer',
            'dates' => '2021 – Present',
            'location' => 'Independent',
        ],
        'signal' => [
            'company' => 'Signal Access Manager',
            'role' => 'Creator and Sole Developer',
            'dates' => 'Jan 2026 – Present',
            'location' => 'Independent',
        ],
        'swingersLead' => [
            'company' => 'Swingers: Crazy Golf Club',
            'role' => 'Lead Platform Developer',
            'dates' => 'May 2025 – Apr 2026',
            'location' => 'New York, NY',
        ],
        'swingersAnalyst' => [
            'company' => 'Swingers: Crazy Golf Club',
            'role' => 'Application Support Analyst / Reception Captain',
            'dates' => 'Mar 2022 – May 2025',
            'location' => 'New York, NY',
        ],
        'sodexo' => [
            'company' => 'Sodexo USA',
            'role' => 'Assistant Manager of Guest Services',
            'dates' => 'Jul 2021 – Dec 2021',
            'location' => 'Flushing, NY',
        ],
        'jetblue' => [
            'company' => 'JetBlue Airways',
            'role' => 'Inflight Crewmember',
            'dates' => 'Oct 2014 – Jun 2021',
            'location' => 'Long Island City, NY',
        ],
        'disney' => [
            'company' => 'Walt Disney World Resort',
            'role' => 'Coordinator, Payroll Analyst, Guest Relations Trainer',
            'dates' => 'May 2007 – Jun 2014',
            'location' => 'Orlando, FL',
        ],
        'education' => ['heading' => 'Education'],
        'contact' => ['heading' => 'Open to relocating'],
    ],

    'lines' => [
        'summary' => [
            'summary' => [
                'corporate' => 'Full-stack developer and technical operations leader specializing in AI-augmented solo development, shipping team-scale platforms through disciplined human-in-the-loop workflows.',
                'honest' => 'I build software alone that companies usually need a whole team for. I\'m good with computers, and I know what needs the human touch versus the monotonous work best fit for machines.',
            ],
        ],
        'skills' => [
            'languages' => [
                'corporate' => 'PHP, Python, JavaScript, TypeScript, Laravel, React, Node.js, Livewire, HTML/CSS, MySQL.',
                'honest' => 'There are a few languages that I learned when it made sense to learn them. Now it allows me to actually troubleshoot instead of blinding following what AI produces.',
            ],
            'systems' => [
                'corporate' => 'REST API integration, database design, systems architecture, multi-tenant platforms, Azure cloud deployment, Git.',
                'honest' => 'I can make systems that were never meant to speak to each other carry a convo. If matchmaking could only be a viable career path...',
            ],
            'ai' => [
                'corporate' => 'Claude Code for spec-driven prompting, iterative code review, test-guided generation, and architectural decision ownership.',
                'honest' => 'I use AI so that it drafts and I decide. Seeing how it approaches solutions teaches me new tricks along the way!',
            ],
            'integrations' => [
                'corporate' => 'Toast POS, Easol, Embed, Signal protocol, Viator.',
                'honest' => 'Good software platforms that need a nudge to understand each other.',
            ],
            'additional' => [
                'corporate' => 'Adobe Creative Suite, Microsoft Office, process automation, data reconciliation.',
                'honest' => 'The standards of analytics are in the toolbelt, doing the things everyone wants to do: make the job easier!',
            ],
        ],
        'alexandria' => [
            'intro' => [
                'corporate' => 'Creator and sole developer of Alexandria, an EAV-structured worldbuilding and creative structuring platform designed to solve a UX problem no existing tool addresses.',
                'honest' => 'I built a tool for writers who, like me, have a thousand ideas and nowhere to put them. It lets you dump the mess first and it is way easier for the ideas to take hold here.',
            ],
            'eav' => [
                'corporate' => 'Architected the platform on an entity-attribute-value (EAV) model, allowing users to define their own entity schemas rather than conforming to a fixed template.',
                'honest' => 'Instead of forcing your world into my boxes, it lets you build your own boxes, and some people have weird boxes. Embrace the weird boxes!',
            ],
            'llm' => [
                'corporate' => 'Built an LLM integration layer that reads each user\'s custom schema dynamically and generates content conforming to their specific world structure.',
                'honest' => 'The AI reads the world you\'ve already built and writes inside its rules, but in worldbuilding, not any script or final copy. Put all the beautiful context in front of you so your scenes are enriched.',
            ],
            'migration' => [
                'corporate' => 'Migrated the platform from Livewire to React to take advantage of the broader frontend ecosystem.',
                'honest' => 'I rebuilt the whole front end in React because the old approach hit a wall and I won\'t let sunk cost fallacies dictate my life!',
            ],
            'capture' => [
                'corporate' => 'Designed the core functionality around a generalized capture-first workflow that adapts to the user\'s evolving understanding of their material.',
                'honest' => 'The whole thing runs on a stubborn belief: you shouldn\'t have to know what you\'re making before you\'re allowed to start.',
            ],
        ],
        'signal' => [
            'intro' => [
                'corporate' => 'Designed and shipped a secure communications platform built on Signal\'s open-source infrastructure for community organizing and rapid response networks, from concept to pilot in two months.',
                'honest' => 'I built a secure way for community groups to organize while maintaining OPSEC. Funny enough, this is how many organizers learn what OPSEC actually feels like!',
            ],
            'auth' => [
                'corporate' => 'Designed a multi-layer authentication and handshake protocol with certificate-based verification, color-coded status signals, and coded vocabulary trees for secure onboarding.',
                'honest' => 'I designed a way to prove you\'re you and not a problem, and the controls are in the hands of each node in the network.',
            ],
            'zip' => [
                'corporate' => 'Built ZIP code adjacency alerting for geo-aware coordination across community networks.',
                'honest' => 'If something\'s happening near you, the people near you hear about it, too.',
            ],
            'decoy' => [
                'corporate' => 'Implemented decoy and silent emergency modes for high-risk operational scenarios.',
                'honest' => 'There\'s a version of the app that lies for you if someone\'s forcing you to open it. I hope nobody ever needs it. Fun fact: check out the history of Agent Garbo. Though, that\'s more of a statement than a fact... carry on.',
            ],
            'myco' => [
                'corporate' => 'Architected the broader Myco Network framework: a federated four-tier communications model with cryptographic trust scoring.',
                'honest' => 'The bigger plan: a network that keeps working even when the internet doesn\'t, and trusts people for what they\'ve done, not who they claim.',
            ],
        ],
        'swingersLead' => [
            'intro' => [
                'corporate' => 'Sole developer of the Swingers Hub, a full-stack internal platform replacing fragmented Excel-based operations across multiple hospitality venues.',
                'honest' => 'I replaced a pile of haunted spreadsheets with one system that actually knew what was going on. By myself. Across multiple venues. Then someone else takes credit higher up the chain for approving it. Thanks, corporate America.',
            ],
            'savings' => [
                'corporate' => 'Delivered Phase 1 at an estimated $900K–$1.35M in labor savings over 8 months, compared to a traditional 4–6 person development team over 12–18 months.',
                'honest' => 'I did the work of the 4-to-6 person team that wasn\'t in the budget to hire. The dev team was  just me and a couple of dogs who contributed in cuddles.',
            ],
            'architecture' => [
                'corporate' => 'Architected and deployed a Laravel/Livewire platform on Azure with 106 database tables, 211 routes, and 61 reusable service classes, integrating Toast, Easol, Embed, and Viator APIs.',
                'honest' => 'What is life without a few statistics to throw onto a presentation slide as a measure of success? I prefer the comments from people using it, but alas, the PowerPoint gods must be appeased.',
            ],
            'releases' => [
                'corporate' => 'Shipped 53 production releases and 1,100+ commits as a solo developer, sustaining an aggressive cadence through rigorous AI-assisted review, testing, and refactoring.',
                'honest' => 'If anything happens, it\'s all on me. Just keep them off the peak time so a stray bug doesn\'t clog up the works.',
            ],
            'reconciliation' => [
                'corporate' => 'Reduced nightly cash reconciliation by 20–30 minutes per venue and cut discrepancy research from 30–60 minutes to under 5 minutes through automated, API-driven pipelines.',
                'honest' => 'Typos in the old spreadsheet or in Toast did not connect well, especially at the end of a long day. Eliminating that time was the biggest first win after deployment.',
            ],
            'azure' => [
                'corporate' => 'Optimized Azure deployment architecture across staging and production environments, separating queue and notification logic into independent deployments to maintain reliability on a cost-efficient tier.',
                'honest' => 'I split the app so the part that sends notifications couldn\'t take down the part that lets people log in: asynchronicity in motion, baby!',
            ],
            'multivenue' => [
                'corporate' => 'Designed scalable multi-venue architecture that onboarded a new location with zero additional custom development, validating the platform\'s franchising readiness.',
                'honest' => 'When they opened a new location, it just worked. Design with the automations from the start and repetition doesn\'t have a chance to take hold.',
            ],
        ],
        'swingersAnalyst' => [
            'intro' => [
                'corporate' => 'Managed operational systems and data workflows across venues, bridging hospitality operations with technical infrastructure, and identified the improvements that led to the Hub platform.',
                'honest' => 'Officially I kept the systems running. Unofficially I kept noticing how much time everyone was losing, and I couldn\'t let it go. That gave me a pretty good purpose!',
            ],
            'automate' => [
                'corporate' => 'Automated processors for operational data extraction, reducing hourly processing time from 12 minutes to 30 seconds.',
                'honest' => 'A job that ate 12 minutes every hour now takes 30 seconds. Do that math across a year and tell me KPIs are the point.',
            ],
            'toast' => [
                'corporate' => 'Led the first systemic improvements to Toast POS configuration, standardizing workflows and reducing errors across venues.',
                'honest' => 'I was the first person to look at our POS setup and ask why every venue did it differently. Luckily, that was the job I was hired to fix.',
            ],
            'golfDiary' => [
                'corporate' => 'Rebuilt the Golf Diary system to support quicker updates for stakeholders while preserving existing operational processes.',
                'honest' => 'I rebuilt the thing people used every single day so it was faster, without breaking the habits they\'d built around it.',
            ],
            'businessCase' => [
                'corporate' => 'Made the business case for a central internal platform during the Easol onboarding, leading to the Hub initiative.',
                'honest' => 'I stood up in a meeting and argued for building the whole platform. It was a Teams meeting, so it wasn\'t nearly as dramatic. I was probably on mute, too.',
            ],
        ],
        'sodexo' => [
            'concierge' => [
                'corporate' => 'Founded the 8 West Concierge Program for VIP clientele and launched the Lobby Concierge Program, consolidating multiple service functions under a single department during a hiring freeze.',
                'honest' => 'During a hiring freeze, I helped lay the groundwork for an extension at a hospital. Covid made sure the project took a lot longer to pan out, but at least I got it started!',
            ],
        ],
        'jetblue' => [
            'safety' => [
                'corporate' => 'Served as departmental safety champion for two years, representing inflight on enterprise-wide safety committees and building feedback channels during major operational changes.',
                'honest' => 'For two years I was the person crewmembers trusted to carry "this isn\'t safe" up to the people who could fix it. No funny quips here: this kind of work was actually meaningful.',
            ],
        ],
        'disney' => [
            'helpDesk' => [
                'corporate' => 'Established the Coordinator Help Desk at Disney\'s Animal Kingdom, the central call center for guest impacts and resolutions, saving over 25,000 labor hours annually through optimized rotations and metrics.',
                'honest' => 'I built the place everyone called when a guest\'s day was going sideways, and ran it well enough to give back 25,000 hours a year. Our overtime was insane before this, and as nice as the paychecks were, the quality of life most certainly was not elevated.',
            ],
            'pmSystem' => [
                'corporate' => 'Developed a project management system for Disney Worldwide Shared Services that improved tracking and clarified objectives across team members, leaders, and stakeholders.',
                'honest' => 'I made a system that helped a big team actually know who was doing what. Revolutionary, I know.',
            ],
        ],
        'education' => [
            'degrees' => [
                'corporate' => 'B.S. Business Administration, Northwood University. Associate in Business Studies, Delta College.',
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
