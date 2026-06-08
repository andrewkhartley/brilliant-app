<?php

namespace App\Console\Commands;

use App\Models\Experiences\Cruise\Destination;
use App\Services\API\HorizonService;
use App\Services\Experiences\Cruise\ApproximateEphemerisService;
use Illuminate\Console\Command;

class CruiseEphemerisCompare extends Command
{
    protected $signature = 'cruise:compare-ephemeris
        {--date= : Date to compare, YYYY-MM-DD. Defaults to today.}
        {--bodies=mer,ven,ear,mar,jup,sat : Comma-separated destination codes.}
        {--json : Output JSON instead of a table.}';

    protected $description = 'Compare the coded cruise ephemeris against NASA Horizons vectors.';

    public function handle(
        ApproximateEphemerisService $ephemeris,
        HorizonService $horizons,
    ): int {
        $date = (string) ($this->option('date') ?: now()->toDateString());
        $timestamp = strtotime($date.' 00:00:00 UTC');

        if ($timestamp === false) {
            $this->error('Invalid --date value. Use YYYY-MM-DD.');

            return self::FAILURE;
        }

        $codes = collect(explode(',', (string) $this->option('bodies')))
            ->map(fn (string $code): string => trim($code))
            ->filter()
            ->values();

        $rows = $codes
            ->map(function (string $code) use ($ephemeris, $horizons, $timestamp): ?array {
                $destination = Destination::getCachedFacts()->firstWhere('destination_code', $code);

                if ($destination === null || ! $destination->horizons) {
                    return [
                        'code' => $code,
                        'name' => $destination?->destination ?? 'Unknown',
                        'status' => 'not comparable',
                    ];
                }

                $horizonData = $horizons->horizonQuery((string) $destination->horizons_id, $timestamp, 1440, 86400);
                $nasa = $horizonData['data'][0] ?? null;

                if (! is_array($nasa)) {
                    return [
                        'code' => $code,
                        'name' => $destination->destination,
                        'status' => 'nasa unavailable',
                    ];
                }

                $local = $ephemeris->positionAt($code, $timestamp);
                $nasaCoordinates = [
                    'x' => (float) $nasa['x'],
                    'y' => (float) $nasa['y'],
                    'z' => (float) $nasa['z'],
                ];
                $deltaKm = $this->distance($local, $nasaCoordinates);
                $nasaRadiusKm = $this->magnitude($nasaCoordinates);

                return [
                    'code' => $code,
                    'name' => $destination->destination,
                    'status' => 'compared',
                    'delta_km' => round($deltaKm),
                    'delta_au' => round($deltaKm / 149_597_870.7, 4),
                    'delta_percent_radius' => $nasaRadiusKm > 0
                        ? round(($deltaKm / $nasaRadiusKm) * 100, 3)
                        : null,
                    'local' => $this->roundedCoordinates($local),
                    'nasa' => $this->roundedCoordinates($nasaCoordinates),
                ];
            })
            ->filter()
            ->values()
            ->all();

        if ($this->option('json')) {
            $this->line(json_encode([
                'date' => gmdate('Y-m-d', $timestamp),
                'rows' => $rows,
            ], JSON_PRETTY_PRINT));

            return self::SUCCESS;
        }

        $this->info('Cruise ephemeris comparison for '.gmdate('Y-m-d', $timestamp));
        $this->table(
            ['Code', 'Name', 'Status', 'Delta km', 'Delta AU', 'Delta % radius'],
            array_map(fn (array $row): array => [
                $row['code'],
                $row['name'],
                $row['status'],
                isset($row['delta_km']) ? number_format($row['delta_km']) : '-',
                $row['delta_au'] ?? '-',
                $row['delta_percent_radius'] ?? '-',
            ], $rows),
        );

        return self::SUCCESS;
    }

    private function distance(array $a, array $b): float
    {
        return sqrt(
            (($a['x'] - $b['x']) ** 2)
            + (($a['y'] - $b['y']) ** 2)
            + (($a['z'] - $b['z']) ** 2),
        );
    }

    private function magnitude(array $coordinates): float
    {
        return sqrt(
            ($coordinates['x'] ** 2)
            + ($coordinates['y'] ** 2)
            + ($coordinates['z'] ** 2),
        );
    }

    private function roundedCoordinates(array $coordinates): array
    {
        return [
            'x' => round($coordinates['x']),
            'y' => round($coordinates['y']),
            'z' => round($coordinates['z']),
        ];
    }
}
