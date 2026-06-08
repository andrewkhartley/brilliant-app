<?php

namespace App\Services\Experiences\Cruise;

use App\Models\Experiences\Cruise\Destination;

class EphemerisCatalog
{
    private const array SELECTABLE_LOCAL_CODES = [];

    private const array LOCAL_BODIES = [
        'cer' => [
            'name' => 'Ceres',
            'semiMajorAu' => 2.7675,
            'periodDays' => 1680.0,
            'inclinationDeg' => 10.59,
            'phaseDeg' => 145.0,
            'mass' => 9.3835e20,
            'radius' => 469.7,
            'orbitalAltitude' => 120,
        ],
        'ves' => [
            'name' => 'Vesta',
            'semiMajorAu' => 2.3618,
            'periodDays' => 1325.0,
            'inclinationDeg' => 7.14,
            'phaseDeg' => 72.0,
            'mass' => 2.59076e20,
            'radius' => 262.7,
            'orbitalAltitude' => 80,
        ],
        'lun' => [
            'name' => 'Luna',
            'parent' => 'ear',
            'parentDistanceKm' => 384400,
            'periodDays' => 27.321661,
            'inclinationDeg' => 5.14,
            'phaseDeg' => 38.0,
            'mass' => 7.342e22,
            'radius' => 1737.4,
            'orbitalAltitude' => 100,
        ],
        'io' => [
            'name' => 'Io',
            'parent' => 'jup',
            'parentDistanceKm' => 421700,
            'periodDays' => 1.769,
            'inclinationDeg' => 0.04,
            'phaseDeg' => 12.0,
            'mass' => 8.9319e22,
            'radius' => 1821.6,
            'orbitalAltitude' => 120,
        ],
        'eur' => [
            'name' => 'Europa',
            'parent' => 'jup',
            'parentDistanceKm' => 671100,
            'periodDays' => 3.551,
            'inclinationDeg' => 0.47,
            'phaseDeg' => 92.0,
            'mass' => 4.7998e22,
            'radius' => 1560.8,
            'orbitalAltitude' => 120,
        ],
        'gan' => [
            'name' => 'Ganymede',
            'parent' => 'jup',
            'parentDistanceKm' => 1070400,
            'periodDays' => 7.155,
            'inclinationDeg' => 0.2,
            'phaseDeg' => 177.0,
            'mass' => 1.4819e23,
            'radius' => 2634.1,
            'orbitalAltitude' => 160,
        ],
        'cal' => [
            'name' => 'Callisto',
            'parent' => 'jup',
            'parentDistanceKm' => 1882700,
            'periodDays' => 16.689,
            'inclinationDeg' => 0.28,
            'phaseDeg' => 240.0,
            'mass' => 1.0759e23,
            'radius' => 2410.3,
            'orbitalAltitude' => 160,
        ],
        'tit' => [
            'name' => 'Titan',
            'parent' => 'sat',
            'parentDistanceKm' => 1221870,
            'periodDays' => 15.945,
            'inclinationDeg' => 0.35,
            'phaseDeg' => 64.0,
            'mass' => 1.3452e23,
            'radius' => 2574.7,
            'orbitalAltitude' => 160,
        ],
        'enc' => [
            'name' => 'Enceladus',
            'parent' => 'sat',
            'parentDistanceKm' => 238020,
            'periodDays' => 1.370,
            'inclinationDeg' => 0.02,
            'phaseDeg' => 205.0,
            'mass' => 1.08022e20,
            'radius' => 252.1,
            'orbitalAltitude' => 80,
        ],
        'tri' => [
            'name' => 'Triton',
            'parent' => 'nep',
            'parentDistanceKm' => 354759,
            'periodDays' => 5.877,
            'inclinationDeg' => 23.0,
            'phaseDeg' => 315.0,
            'mass' => 2.14e22,
            'radius' => 1353.4,
            'orbitalAltitude' => 120,
        ],
    ];

    public static function destinations(): array
    {
        $fromDatabase = Destination::getCachedFacts()
            ->map(fn (Destination $destination): array => [
                'code' => $destination->destination_code,
                'name' => $destination->destination,
            ]);

        $local = collect(self::LOCAL_BODIES)
            ->only(self::SELECTABLE_LOCAL_CODES)
            ->map(fn (array $body, string $code): array => [
                'code' => $code,
                'name' => $body['name'],
            ]);

        return $fromDatabase
            ->merge($local)
            ->unique('code')
            ->values()
            ->all();
    }

    public static function has(string $code): bool
    {
        if (array_key_exists($code, self::LOCAL_BODIES)) {
            return true;
        }

        return Destination::getCachedFacts()->contains('destination_code', $code);
    }

    public static function name(string $code): string
    {
        if (isset(self::LOCAL_BODIES[$code])) {
            return self::LOCAL_BODIES[$code]['name'];
        }

        $destination = Destination::getCachedFacts()->firstWhere('destination_code', $code);

        return $destination?->destination ?? $code;
    }

    public static function details(string $code): ?array
    {
        $body = self::LOCAL_BODIES[$code] ?? null;

        if ($body === null) {
            return null;
        }

        return [
            'code' => $code,
            'name' => $body['name'],
            'horizonsId' => 0,
            'mass' => $body['mass'],
            'radius' => $body['radius'],
            'orbitalPeriod' => 0,
            'orbitalAltitude' => $body['orbitalAltitude'],
            'tilt' => 0,
            'offset' => 0,
            'isOrbital' => true,
            'x' => 0,
            'y' => 0,
            'z' => 0,
        ];
    }

    public static function body(string $code): ?array
    {
        return self::LOCAL_BODIES[$code] ?? null;
    }
}
