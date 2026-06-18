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
        'title' => 'Everything here is true. The boring version was also true.',
        'body' => 'I just got tired of describing real work in a language built to make it sound fake. Drag the handle — the left is what you\'re supposed to write. The right is what actually happened.',
        'instruction' => 'Every section has its own handle — drag it to wipe that section between the two. Park it in the middle to watch them fight.',
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
                'honest' => 'I build software alone that companies usually need a whole team for. I\'m good with computers, and I\'m allergic to watching people do by hand what a machine should be doing.',
            ],
        ],
        'skills' => [
            'languages' => [
                'corporate' => 'PHP, Python, JavaScript, TypeScript, Laravel, React, Node.js, Livewire, HTML/CSS, MySQL.',
                'honest' => 'The languages I argue with at 2am. Most nights I win.',
            ],
            'systems' => [
                'corporate' => 'REST API integration, database design, systems architecture, multi-tenant platforms, Azure cloud deployment, Git.',
                'honest' => 'I can make two systems that were never meant to speak to each other speak to each other. Then I write down how, because future-me has no memory.',
            ],
            'ai' => [
                'corporate' => 'Claude Code for spec-driven prompting, iterative code review, test-guided generation, and architectural decision ownership.',
                'honest' => 'I use AI the way a good editor uses a sharp pencil. It drafts, I decide. The taste is mine; the typing is shared.',
            ],
            'integrations' => [
                'corporate' => 'Toast POS, Easol, Embed, Signal protocol, Viator.',
                'honest' => 'Software other people picked that I had to make behave.',
            ],
            'additional' => [
                'corporate' => 'Adobe Creative Suite, Microsoft Office, process automation, data reconciliation.',
                'honest' => 'I can also make a spreadsheet stop ruining someone\'s evening. The dog supervises.',
            ],
        ],
        'alexandria' => [
            'intro' => [
                'corporate' => 'Creator and sole developer of Alexandria, an EAV-structured worldbuilding and creative structuring platform designed to solve a UX problem no existing tool addresses.',
                'honest' => 'I built a tool for writers who, like me, have a thousand ideas and nowhere to put them. It lets you dump the mess first and find the shape later.',
            ],
            'eav' => [
                'corporate' => 'Architected the platform on an entity-attribute-value (EAV) model, allowing users to define their own entity schemas rather than conforming to a fixed template.',
                'honest' => 'Instead of forcing your world into my boxes, it lets you build your own boxes. Turns out everyone\'s imaginary world is shaped differently.',
            ],
            'llm' => [
                'corporate' => 'Built an LLM integration layer that reads each user\'s custom schema dynamically and generates content conforming to their specific world structure.',
                'honest' => 'The AI reads the world you\'ve already built and writes inside its rules, instead of handing you generic fantasy oatmeal.',
            ],
            'migration' => [
                'corporate' => 'Migrated the platform from Livewire to React to take advantage of the broader frontend ecosystem.',
                'honest' => 'I rebuilt the whole front end in React because the old approach hit a wall. Nobody made me. I just wanted it to be better.',
            ],
            'capture' => [
                'corporate' => 'Designed the core functionality around a generalized capture-first workflow that adapts to the user\'s evolving understanding of their material.',
                'honest' => 'The whole thing runs on one stubborn belief: you shouldn\'t have to know what you\'re making before you\'re allowed to start.',
            ],
        ],
        'signal' => [
            'intro' => [
                'corporate' => 'Designed and shipped a secure communications platform built on Signal\'s open-source infrastructure for community organizing and rapid response networks, from concept to pilot in two months.',
                'honest' => 'I built a secure way for community groups to organize without their plans leaking. Concept to a working pilot in two months, because some things shouldn\'t wait.',
            ],
            'auth' => [
                'corporate' => 'Designed a multi-layer authentication and handshake protocol with certificate-based verification, color-coded status signals, and coded vocabulary trees for secure onboarding.',
                'honest' => 'I designed a way to prove you\'re you and not a problem, without trusting some company in the middle to vouch for you.',
            ],
            'zip' => [
                'corporate' => 'Built ZIP code adjacency alerting for geo-aware coordination across community networks.',
                'honest' => 'If something\'s happening near you, the people near you hear about it first.',
            ],
            'decoy' => [
                'corporate' => 'Implemented decoy and silent emergency modes for high-risk operational scenarios.',
                'honest' => 'There\'s a version of the app that lies for you if someone\'s forcing you to open it. I hope nobody ever needs it.',
            ],
            'myco' => [
                'corporate' => 'Architected the broader Myco Network framework: a federated four-tier communications model with cryptographic trust scoring.',
                'honest' => 'The bigger plan: a network that keeps working even when the internet doesn\'t, and trusts people for what they\'ve earned, not who they claim to be.',
            ],
        ],
        'swingersLead' => [
            'intro' => [
                'corporate' => 'Sole developer of the Swingers Hub, a full-stack internal platform replacing fragmented Excel-based operations across multiple hospitality venues.',
                'honest' => 'I replaced a pile of haunted spreadsheets with one system that actually knew what was going on. By myself. Across multiple venues.',
            ],
            'savings' => [
                // feral
                'corporate' => 'Delivered Phase 1 at an estimated $900K–$1.35M in labor savings over 8 months, compared to a traditional 4–6 person development team over 12–18 months.',
                'honest' => 'I did the work of the 4-to-6 person team that was never hired. The savings are real. The team was always just me — and a dog, who did not contribute.',
            ],
            'architecture' => [
                'corporate' => 'Architected and deployed a Laravel/Livewire platform on Azure with 106 database tables, 211 routes, and 61 reusable service classes, integrating Toast, Easol, Embed, and Viator APIs.',
                'honest' => '106 tables, 211 routes, four outside systems that didn\'t want to cooperate, one person holding the whole map in his head. The map was getting big.',
            ],
            'releases' => [
                'corporate' => 'Shipped 53 production releases and 1,100+ commits as a solo developer, sustaining an aggressive cadence through rigorous AI-assisted review, testing, and refactoring.',
                'honest' => '53 releases. 1,100+ commits. Zero coworkers to blame. It shipped because I kept shipping it.',
            ],
            'reconciliation' => [
                'corporate' => 'Reduced nightly cash reconciliation by 20–30 minutes per venue and cut discrepancy research from 30–60 minutes to under 5 minutes through automated, API-driven pipelines.',
                'honest' => 'People spent half an hour every night chasing pennies in a spreadsheet. Now the computer finishes before they\'re done saying "reconciliation."',
            ],
            'azure' => [
                'corporate' => 'Optimized Azure deployment architecture across staging and production environments, separating queue and notification logic into independent deployments to maintain reliability on a cost-efficient tier.',
                'honest' => 'I split the app so the part that sends emails couldn\'t take down the part that lets people log in — then made it cheap, because nobody was paying for a second server. I was the budget.',
            ],
            'multivenue' => [
                'corporate' => 'Designed scalable multi-venue architecture that onboarded a new location with zero additional custom development, validating the platform\'s franchising readiness.',
                'honest' => 'When they opened a new location, it just worked. No new code. That\'s the whole dream, and it came true once, quietly, on a Tuesday.',
            ],
        ],
        'swingersAnalyst' => [
            'intro' => [
                'corporate' => 'Managed operational systems and data workflows across venues, bridging hospitality operations with technical infrastructure, and identified the improvements that led to the Hub platform.',
                'honest' => 'Officially I kept the systems running. Unofficially I kept noticing how much time everyone was losing, and I couldn\'t let it go. That itch became the Hub.',
            ],
            'automate' => [
                'corporate' => 'Automated processors for operational data extraction, reducing hourly processing time from 12 minutes to 30 seconds.',
                'honest' => 'A job that ate 12 minutes every hour now takes 30 seconds. Do that math across a year and tell me KPIs are the point.',
            ],
            'toast' => [
                'corporate' => 'Led the first systemic improvements to Toast POS configuration, standardizing workflows and reducing errors across venues.',
                'honest' => 'I was the first person to look at our POS setup and ask why every venue did it differently. Then I made them stop.',
            ],
            'golfDiary' => [
                'corporate' => 'Rebuilt the Golf Diary system to support quicker updates for stakeholders while preserving existing operational processes.',
                'honest' => 'I rebuilt the thing people used every single day so it was faster, without breaking the habits they\'d built around it.',
            ],
            'businessCase' => [
                'corporate' => 'Made the business case for a central internal platform during the Easol onboarding, leading to the Hub initiative.',
                'honest' => 'I stood up in a meeting and argued for building the whole platform. Then I had to go build it.',
            ],
        ],
        'sodexo' => [
            'concierge' => [
                'corporate' => 'Founded the 8 West Concierge Program for VIP clientele and launched the Lobby Concierge Program, consolidating multiple service functions under a single department during a hiring freeze.',
                'honest' => 'During a hiring freeze, I took several jobs nobody was allowed to fill and quietly turned them into one program that actually worked.',
            ],
        ],
        'jetblue' => [
            'safety' => [
                'corporate' => 'Served as departmental safety champion for two years, representing inflight on enterprise-wide safety committees and building feedback channels during major operational changes.',
                'honest' => 'For two years I was the person crewmembers trusted to carry "this isn\'t safe" up to the people who could fix it. I took that seriously.',
            ],
        ],
        'disney' => [
            'helpDesk' => [
                'corporate' => 'Established the Coordinator Help Desk at Disney\'s Animal Kingdom, the central call center for guest impacts and resolutions, saving over 25,000 labor hours annually through optimized rotations and metrics.',
                'honest' => 'I built the place everyone called when a guest\'s day was going sideways, and ran it well enough to give back 25,000 hours a year. At Disney. With actual animals nearby. The dog was jealous.',
            ],
            'pmSystem' => [
                'corporate' => 'Developed a project management system for Disney Worldwide Shared Services that improved tracking and clarified objectives across team members, leaders, and stakeholders.',
                'honest' => 'I made a system that helped a big team actually know who was doing what. Revolutionary, I know.',
            ],
        ],
        'education' => [
            'degrees' => [
                'corporate' => 'B.S. Business Administration, Northwood University. Associate in Business Studies, Delta College.',
                'honest' => 'I studied business. The irony of where that eventually led me is not lost on me.',
            ],
        ],
        'contact' => [
            'relocation' => [
                'corporate' => 'Open to remote work and relocation to CA, OR, or WA.',
                'honest' => 'I will move across the country for people who don\'t make me write sentences like the one on the left.',
            ],
        ],
    ],
];
