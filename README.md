# Brilliant Application Site

A small, story-driven multi-page site built as part of my application to [Brilliant](https://brilliant.org). It tells the story of my pandemic-era science communication work and lets visitors play with three interactive experiences I've built: an Interstellar Travel Agency (relativity), a Planet Cruise (orbital trips with live NASA Horizons data), and an O'Neill Cylinder Habitat. The signature visual technique is a from-scratch implementation of Disney's 1937 multi-plane camera, expressed as a React component that anchors layers at the top and bottom of a section to form a shadowbox we look INTO.

## What's lifted, what's new

Part of this site was assembled relatively quickly with AI assistance. The physics equation classes (orbital mechanics, relativistic speeds), the NASA Horizons API integration, and the trip-builder service code were lifted from Undaunted — an earlier project of mine where I authored them by hand pre-AI, over a much longer period. The new construction in this sprint is the `MultiPlaneScene` engine, the scene authoring, the Inertia + React integration glue, and the visual scaffolding. The commit history is honest about which is which: look for `feat: lift ...` commits with source paths in their bodies.

Scaffolding origin: [`laravel/blank-react-starter-kit`](https://github.com/laravel/blank-react-starter-kit) — Laravel's official no-auth React variant, chosen because v1 has no users.

## Tech stack

- **Laravel 13** + **Inertia.js v3** — server-rendered React without a separate API layer (no Axios; Inertia v3 ships its own XHR client)
- **React 19** + **TypeScript** (strict mode)
- **Tailwind CSS v4** with CSS-first config in `resources/css/app.css` and logical-property variants for future RTL support
- **GSAP + ScrollTrigger** — drives the `MultiPlaneScene` engine
- **KaTeX** (HTML + MathML output) — equation rendering with screen-reader support
- **dnd-kit** — keyboard-accessible drag-and-drop for the Cruise destination picker
- **Laravel Wayfinder** — auto-generates typed TypeScript functions for Laravel routes
- **Laravel Boost** — first-party MCP server for AI-assisted development; selectively configured
- **Vite 8** + **ESLint 9** + **Prettier 3** + **Pint** + **Pest 4**

## Where to look in this repo

- `resources/js/components/multi-plane-scene/` — the multi-plane camera engine (Phase 5)
- `resources/js/pages/landing.tsx` (+ `sections/`) — the story-led landing page (Phase 7)
- `resources/js/pages/playground/` — the three interactive experiences (Phases 8–11)
- `app/Equations/` — physics + geometry classes (lifted from Undaunted, Phase 2)
- `app/Services/API/HorizonService.php` — NASA Horizons wrapper (lifted, Phase 2)
- `lang/en/` — translation keys; all user-facing strings flow through here (Phase 4 onward)
- `tests/` — Pest 4 (PHP) + Vitest (TS), including parity tests for the math twins
- `CLAUDE.md` — auto-generated Laravel Boost guidelines for AI agents

The build is sequenced as a series of atomic commits — `feat:`, `chore:`, `polish:`, `docs:`, `fix:`, `test:`. The commit history is intended as a second artifact: scrolling it should read like a build journal.

## How to run locally

Requires PHP ≥ 8.4, Composer, Node ≥ 18, npm, and (on Windows/macOS) [Laravel Herd](https://herd.laravel.com/) for the `.test` domain. The starter kit ships a `composer run dev` script that runs Vite, the queue listener, and log tailing in parallel.

```sh
composer install
npm install
cp .env.example .env
php artisan key:generate
composer run dev
```

Visit `http://brilliant-app.test` (via Herd, once configured) or `http://127.0.0.1:8000` (via `php artisan serve`).

## Credits & inspirations

- **Disney's 1937 multi-plane camera** — debuted with _The Old Mill_, refined for _Snow White_. The conceptual ancestor of every modern parallax effect; explicitly credited as the inspiration for `MultiPlaneScene`.
- **Brilliant's "[Hand-crafted, machine-made](https://blog.brilliant.org/hand-crafted-machine-made/)" essay** — the philosophical compass for this site's design.
- **NASA Horizons** ([ssd.jpl.nasa.gov/horizons](https://ssd.jpl.nasa.gov/horizons/)) — live ephemeris data powering the Planet Cruise experience.
- **Firewatch website** — original reference for layered-depth header parallax; replaced here by the multi-plane / shadowbox abstraction.
- **Laravel's blank React starter kit** — the foundation. Customized for this project.

## License

MIT. See [`LICENSE`](./LICENSE).
