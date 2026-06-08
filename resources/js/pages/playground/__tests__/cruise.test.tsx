/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import CruisePage from '../cruise';

vi.mock('@inertiajs/react', () => ({
    Head: ({ children }: { children: ReactNode }) => <>{children}</>,
    Link: ({ children, href }: { children: ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
    router: {
        post: vi.fn(),
        visit: vi.fn(),
    },
    usePage: () => ({
        props: {
            errors: {},
            locale: 'en',
            dir: 'ltr',
            translations: {
                common: {
                    copyright: 'Copyright',
                    footerLabel: 'Footer',
                    siteName: 'Brilliant',
                    primaryNav: 'Primary navigation',
                },
                nav: {
                    playground: 'Playground',
                    projects: 'Projects',
                },
                cruise: {
                    title: 'Plan a Cruise',
                    launchOverlay: {
                        kicker: 'Journey preparation',
                    },
                    form: {
                        planner: {
                            kicker: 'Mission planner',
                            dateStep: 'Departure date',
                            destinationsStep: 'Destinations',
                            destinationCount: ':count selected',
                            manifestHeading: 'Trip manifest',
                            departureLabel: 'Departure',
                            routeLabel: 'Route',
                            noDateSelected: 'Not selected yet',
                            noRouteSelected: 'No destinations yet',
                            destinationsEyebrow: 'Route assembly',
                            destinationsPanelHeading:
                                'Choose your cruise stops',
                            destinationsPanelBody: 'Add destinations.',
                            continueToDestinations: 'Choose destinations',
                            backToDate: 'Change date',
                        },
                        date: {
                            label: 'Departure date',
                            hint: 'Pick a date.',
                            ariaLabel: 'Trip departure date',
                        },
                        destinations: {
                            label: 'Destinations',
                            hint: 'Choose destinations.',
                            emptyState: 'No destinations picked yet.',
                            selectedAriaLabel: 'Selected destinations',
                            availableLabel: 'Available destinations',
                            add: 'Add :name',
                            positionLabel: ':position.',
                            removeLabel: 'Remove',
                            removeAriaLabel: 'Remove :name',
                            layoverLabel: 'Days at :name',
                            layoverInputAriaLabel: 'Days at :name',
                            layoverUnitLabel: 'days',
                        },
                        submit: {
                            idle: 'Plan trip',
                            plotting: 'Plotting trajectory...',
                        },
                        submitDisabledHint:
                            'Pick at least one destination and a departure date to plan a trip.',
                    },
                },
            },
        },
    }),
}));

describe('CruisePage planner flow', () => {
    beforeEach(() => {
        Object.defineProperty(window, 'matchMedia', {
            configurable: true,
            value: vi.fn().mockImplementation((query: string) => ({
                addEventListener: vi.fn(),
                addListener: vi.fn(),
                dispatchEvent: vi.fn(),
                matches: false,
                media: query,
                onchange: null,
                removeEventListener: vi.fn(),
                removeListener: vi.fn(),
            })),
        });
    });

    afterEach(() => {
        cleanup();
    });

    test('moves from date selection to destination selection', () => {
        render(
            <CruisePage
                destinations={[
                    { code: 'mars', name: 'Mars' },
                    { code: 'jupiter', name: 'Jupiter' },
                ]}
                ephemerisDestinations={[
                    { code: 'mars', name: 'Mars' },
                    { code: 'jupiter', name: 'Jupiter' },
                ]}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: /^Today,/ }));
        fireEvent.click(
            screen.getByRole('button', { name: /choose destinations/i }),
        );

        expect(screen.queryByText('Available destinations')).not.toBeNull();
        expect(
            screen.queryByRole('button', { name: 'Add Mars' }),
        ).not.toBeNull();
    });
});
