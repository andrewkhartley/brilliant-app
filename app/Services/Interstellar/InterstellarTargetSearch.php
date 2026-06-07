<?php

namespace App\Services\Interstellar;

use App\Data\InterstellarTargets;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class InterstellarTargetSearch
{
    public function __construct(
        private readonly GaiaTapClient $gaia,
        private readonly SesameNameResolver $resolver,
    ) {}

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function search(string $query): Collection
    {
        $seededTargets = InterstellarTargets::search($query);
        $normalisedQuery = mb_strtolower(trim($query));

        Log::info('Interstellar target search requested.', [
            'query' => $query,
            'normalisedQuery' => $normalisedQuery,
            'seededCount' => $seededTargets->count(),
        ]);

        if ($normalisedQuery === '') {
            Log::info('Interstellar target search returning default seeded targets.', [
                'count' => $seededTargets->count(),
            ]);

            return $seededTargets;
        }

        if (mb_strlen($normalisedQuery) < 2) {
            Log::info('Interstellar target search skipped live lookup for short query.', [
                'query' => $query,
            ]);

            return $seededTargets;
        }

        $liveTarget = Cache::remember(
            'interstellar.gaia-target.'.sha1($normalisedQuery),
            now()->addDays(7),
            fn (): ?array => $this->searchGaia($query),
        );

        if ($liveTarget === null) {
            Log::info('Interstellar target search found no live Gaia target; returning seeded matches.', [
                'query' => $query,
                'seededCount' => $seededTargets->count(),
            ]);

            return $seededTargets;
        }

        $targets = $seededTargets
            ->reject(fn (array $target): bool => $this->isDuplicateTarget(
                $target,
                $liveTarget,
                $normalisedQuery,
            ))
            ->prepend($liveTarget)
            ->values()
            ->take(8);

        Log::info('Interstellar target search returning Gaia-enhanced results.', [
            'query' => $query,
            'liveTarget' => $liveTarget['name'] ?? null,
            'count' => $targets->count(),
        ]);

        return $targets;
    }

    /**
     * @return array<string, mixed>|null
     */
    private function searchGaia(string $query): ?array
    {
        $coordinates = $this->resolver->resolve($query);

        if ($coordinates === null) {
            return null;
        }

        return $this->gaia->nearestSource(
            trim($query),
            $coordinates['ra'],
            $coordinates['dec'],
        );
    }

    /**
     * @param  array<string, mixed>  $target
     * @param  array<string, mixed>  $liveTarget
     */
    private function isDuplicateTarget(
        array $target,
        array $liveTarget,
        string $normalisedQuery,
    ): bool
    {
        return (string) $target['id'] === (string) $liveTarget['id']
            || str_contains($this->targetSearchText($target), $normalisedQuery);
    }

    /**
     * @param  array<string, mixed>  $target
     */
    private function targetSearchText(array $target): string
    {
        $aliases = is_array($target['aliases'] ?? null) ? $target['aliases'] : [];

        return mb_strtolower(implode(' ', [
            (string) ($target['name'] ?? ''),
            ...$aliases,
        ]));
    }
}
