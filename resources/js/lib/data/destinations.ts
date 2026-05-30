/**
 * Static destination data for the Interstellar experience (Phase 8).
 *
 * Distances are in light-years. The 5 destinations span short
 * (Proxima Centauri at 4.24 ly) to cosmic (Andromeda Galaxy at
 * 2.5M ly) so the trip-time experience is dramatic across the
 * acceleration slider's range.
 */

export interface Destination {
    id: string;
    name: string;
    distanceLy: number;
    description?: string;
}

export const destinations: readonly Destination[] = [
    {
        id: 'proxima-centauri-b',
        name: 'Proxima Centauri b',
        distanceLy: 4.24,
        description:
            'Closest known exoplanet; orbits the nearest star to our Sun.',
    },
    {
        id: 'tau-ceti',
        name: 'Tau Ceti',
        distanceLy: 11.9,
        description: 'A sun-like star; potential planetary candidates.',
    },
    {
        id: 'trappist-1',
        name: 'TRAPPIST-1',
        distanceLy: 39.6,
        description:
            'Seven Earth-sized planets in the habitable zone of a single star.',
    },
    {
        id: 'kepler-442b',
        name: 'Kepler-442b',
        distanceLy: 1206,
        description:
            'A super-Earth in the habitable zone of an orange dwarf star.',
    },
    {
        id: 'andromeda-galaxy',
        name: 'Andromeda Galaxy',
        distanceLy: 2_537_000,
        description: 'Our nearest large galactic neighbor.',
    },
];
