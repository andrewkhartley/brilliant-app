<?php

namespace App\Services\Interstellar;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GaiaTapClient
{
    private const TAP_SYNC_URL = 'https://gea.esac.esa.int/tap-server/tap/sync';

    private const PARSEC_TO_LIGHT_YEARS = 3.26156;

    private const CONE_RADIUS_ARCSECONDS = 60.0;

    /**
     * Query Gaia DR3 near a resolved sky coordinate and return the best source.
     *
     * @return array{id: string, name: string, aliases: array<int, string>, ra: float, dec: float, distanceLy: float, source: string, sourceId: string}|null
     */
    public function nearestSource(string $name, float $ra, float $dec): ?array
    {
        Log::info('Interstellar Gaia TAP lookup started.', [
            'name' => $name,
            'ra' => $ra,
            'dec' => $dec,
        ]);

        $query = sprintf(
            <<<'ADQL'
SELECT TOP 1 source_id, ra, dec, parallax, phot_g_mean_mag,
DISTANCE(%F, %F, ra, dec) AS ang_sep
FROM gaiadr3.gaia_source
WHERE DISTANCE(%F, %F, ra, dec) < %F / 3600.0
AND parallax IS NOT NULL
AND parallax > 0
ORDER BY ang_sep ASC, phot_g_mean_mag ASC
ADQL,
            $ra,
            $dec,
            $ra,
            $dec,
            self::CONE_RADIUS_ARCSECONDS,
        );

        $response = Http::timeout(8)
            ->retry(1, 200)
            ->asForm()
            ->post(self::TAP_SYNC_URL, [
                'REQUEST' => 'doQuery',
                'LANG' => 'ADQL',
                'FORMAT' => 'json',
                'QUERY' => $query,
            ]);

        if (! $response->ok()) {
            Log::warning('Interstellar Gaia TAP lookup failed.', [
                'name' => $name,
                'status' => $response->status(),
                'bodyPreview' => mb_substr($response->body(), 0, 500),
            ]);

            return null;
        }

        $rows = $this->extractRows($response->json());
        $row = $rows[0] ?? null;

        if (! is_array($row) || ! isset($row['parallax'], $row['ra'], $row['dec'])) {
            Log::warning('Interstellar Gaia TAP lookup returned no usable source.', [
                'name' => $name,
                'rowCount' => count($rows),
            ]);

            return null;
        }

        $parallax = (float) $row['parallax'];

        if ($parallax <= 0) {
            Log::warning('Interstellar Gaia TAP lookup returned non-positive parallax.', [
                'name' => $name,
                'parallax' => $parallax,
            ]);

            return null;
        }

        $distanceParsecs = 1000 / $parallax;
        $target = [
            'id' => 'gaia-'.(string) ($row['source_id'] ?? md5($name.$ra.$dec)),
            'name' => $name,
            'aliases' => [],
            'ra' => (float) $row['ra'],
            'dec' => (float) $row['dec'],
            'distanceLy' => $distanceParsecs * self::PARSEC_TO_LIGHT_YEARS,
            'source' => 'Gaia DR3 via ESA TAP',
            'sourceId' => (string) ($row['source_id'] ?? ''),
        ];

        Log::info('Interstellar Gaia TAP lookup resolved target.', [
            'name' => $name,
            'sourceId' => $target['sourceId'],
            'distanceLy' => $target['distanceLy'],
        ]);

        return $target;
    }

    /**
     * ESA TAP JSON commonly returns a VOTable-like payload with metadata and a
     * data array. Keep the parser defensive so a response-format tweak fails
     * softly back to seeded targets.
     *
     * @param  mixed  $payload
     * @return array<int, array<string, mixed>>
     */
    private function extractRows(mixed $payload): array
    {
        if (! is_array($payload)) {
            return [];
        }

        if (isset($payload['data']) && is_array($payload['data'])) {
            $metadata = $payload['metadata'] ?? [];

            if (! is_array($metadata)) {
                return [];
            }

            $columns = array_map(
                fn (mixed $column): ?string => is_array($column) && isset($column['name'])
                    ? (string) $column['name']
                    : null,
                $metadata,
            );
            $columns = array_values(array_filter($columns));

            return collect($payload['data'])
                ->filter(fn (mixed $row): bool => is_array($row))
                ->map(function (array $row) use ($columns): array {
                    if (count($columns) !== count($row)) {
                        return [];
                    }

                    return array_combine($columns, $row) ?: [];
                })
                ->filter()
                ->values()
                ->all();
        }

        return [];
    }
}
