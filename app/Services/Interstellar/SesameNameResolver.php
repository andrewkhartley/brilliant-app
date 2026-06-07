<?php

namespace App\Services\Interstellar;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SesameNameResolver
{
    /**
     * Resolve a common object name into ICRS coordinates.
     *
     * CDS Sesame is the same class of resolver the Gaia Archive UI documents
     * for turning target names into coordinates before running a cone search.
     *
     * @return array{ra: float, dec: float}|null
     */
    public function resolve(string $query): ?array
    {
        $query = trim($query);

        if ($query === '') {
            return null;
        }

        Log::info('Interstellar Sesame lookup started.', [
            'query' => $query,
        ]);

        $response = Http::timeout(6)
            ->retry(1, 150)
            ->accept('application/xml')
            ->get('https://cds.unistra.fr/cgi-bin/nph-sesame/-oxp/SNV?'.rawurlencode($query));

        if (! $response->ok()) {
            Log::warning('Interstellar Sesame lookup failed.', [
                'query' => $query,
                'status' => $response->status(),
                'bodyPreview' => mb_substr($response->body(), 0, 300),
            ]);

            return null;
        }

        $body = $response->body();
        $ra = $this->extractCoordinate($body, 'jradeg');
        $dec = $this->extractCoordinate($body, 'jdedeg');

        if ($ra === null || $dec === null) {
            Log::warning('Interstellar Sesame lookup returned no coordinates.', [
                'query' => $query,
                'bodyPreview' => mb_substr($body, 0, 300),
            ]);

            return null;
        }

        Log::info('Interstellar Sesame lookup resolved coordinates.', [
            'query' => $query,
            'ra' => $ra,
            'dec' => $dec,
        ]);

        return [
            'ra' => $ra,
            'dec' => $dec,
        ];
    }

    private function extractCoordinate(string $xml, string $tag): ?float
    {
        if (! preg_match(sprintf('/<%1$s>([^<]+)<\/%1$s>/', preg_quote($tag, '/')), $xml, $matches)) {
            return null;
        }

        return is_numeric($matches[1]) ? (float) $matches[1] : null;
    }
}
