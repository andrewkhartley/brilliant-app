<?php

namespace App\Data;

use Illuminate\Support\Collection;

class InterstellarTargets
{
    /**
     * Seeded target catalogue for the Interstellar page.
     *
     * The shape intentionally mirrors the data a live Gaia/TAP lookup should
     * return so the frontend does not care whether a target came from this
     * seed list or a future archive query.
     *
     * @return Collection<int, array{id: string, name: string, aliases: array<int, string>, ra: float, dec: float, distanceLy: float, source: string}>
     */
    public static function search(string $query): Collection
    {
        $normalisedQuery = mb_strtolower(trim($query));

        if ($normalisedQuery === '') {
            return collect(self::targets())
                ->sortBy('distanceLy')
                ->values()
                ->take(12);
        }

        return collect(self::targets())
            ->filter(function (array $target) use ($normalisedQuery): bool {
                $searchText = mb_strtolower(implode(' ', [
                    $target['name'],
                    ...$target['aliases'],
                ]));

                return str_contains($searchText, $normalisedQuery);
            })
            ->sortBy('distanceLy')
            ->values()
            ->take(12);
    }

    /**
     * @return array<int, array{id: string, name: string, aliases: array<int, string>, ra: float, dec: float, distanceLy: float, source: string}>
     */
    private static function targets(): array
    {
        return [
            [
                'id' => 'proxima-centauri',
                'name' => 'Proxima Centauri',
                'aliases' => ['Alpha Centauri C', 'Gliese 551', 'Proxima'],
                'ra' => 217.42894,
                'dec' => -62.67949,
                'distanceLy' => 4.2465,
                'source' => 'Preset destination',
            ],
            [
                'id' => 'alpha-centauri-a',
                'name' => 'Alpha Centauri A',
                'aliases' => ['Rigil Kentaurus', 'Alpha Cen A'],
                'ra' => 219.90206,
                'dec' => -60.83399,
                'distanceLy' => 4.344,
                'source' => 'Preset destination',
            ],
            [
                'id' => 'barnards-star',
                'name' => "Barnard's Star",
                'aliases' => ['Gliese 699', 'Barnard'],
                'ra' => 269.45402,
                'dec' => 4.66829,
                'distanceLy' => 5.963,
                'source' => 'Preset destination',
            ],
            [
                'id' => 'wolf-359',
                'name' => 'Wolf 359',
                'aliases' => ['CN Leonis', 'Gliese 406'],
                'ra' => 164.12099,
                'dec' => 7.01498,
                'distanceLy' => 7.86,
                'source' => 'Preset destination',
            ],
            [
                'id' => 'lalande-21185',
                'name' => 'Lalande 21185',
                'aliases' => ['Gliese 411', 'HD 95735'],
                'ra' => 165.83125,
                'dec' => 35.96988,
                'distanceLy' => 8.31,
                'source' => 'Preset destination',
            ],
            [
                'id' => 'sirius-a',
                'name' => 'Sirius A',
                'aliases' => ['Alpha Canis Majoris', 'Sirius'],
                'ra' => 101.28716,
                'dec' => -16.71612,
                'distanceLy' => 8.60,
                'source' => 'Preset destination',
            ],
            [
                'id' => 'epsilon-eridani',
                'name' => 'Epsilon Eridani',
                'aliases' => ['Ran', 'Eps Eri', 'HD 22049'],
                'ra' => 53.23269,
                'dec' => -9.45826,
                'distanceLy' => 10.47,
                'source' => 'Preset destination',
            ],
            [
                'id' => 'tau-ceti',
                'name' => 'Tau Ceti',
                'aliases' => ['HD 10700', 'Gliese 71'],
                'ra' => 26.01701,
                'dec' => -15.93748,
                'distanceLy' => 11.9,
                'source' => 'Preset destination',
            ],
            [
                'id' => 'vega',
                'name' => 'Vega',
                'aliases' => ['Alpha Lyrae', 'HD 172167'],
                'ra' => 279.23473,
                'dec' => 38.78369,
                'distanceLy' => 25.04,
                'source' => 'Preset destination',
            ],
            [
                'id' => 'polaris',
                'name' => 'Polaris',
                'aliases' => ['North Star', 'Alpha Ursae Minoris', 'Polaris Aa'],
                'ra' => 37.95456,
                'dec' => 89.26411,
                'distanceLy' => 447.0,
                'source' => 'Preset destination',
            ],
            [
                'id' => 'trappist-1',
                'name' => 'TRAPPIST-1',
                'aliases' => ['2MASS J23062928-0502285'],
                'ra' => 346.62237,
                'dec' => -5.04140,
                'distanceLy' => 40.66,
                'source' => 'Preset destination',
            ],
            [
                'id' => 'andromeda-galaxy',
                'name' => 'Andromeda Galaxy',
                'aliases' => ['M31', 'Messier 31', 'NGC 224', 'Andromeda'],
                'ra' => 10.68471,
                'dec' => 41.26875,
                'distanceLy' => 2_537_000.0,
                'source' => 'Preset destination',
            ],
        ];
    }
}
