<?php

namespace App\Services\API;

use App\Services\Sessions\SessionManager;
use GuzzleHttp\Exception\GuzzleException;
use Illuminate\Support\Facades\Storage;

/**
 * Persistent file-backed cache wrapper around HorizonService.
 *
 * Extends HorizonService so that all existing consumers (which typehint the
 * concrete class) receive the cache transparently when the container binds
 * HorizonService::class to HorizonCache::class.
 *
 * Cache key format: horizons-cache/{id}-{legStart}-{stepSize}-{duration}.json
 * (defaults from HorizonService constants are resolved before the key is built
 * so that calls with omitted optional args still hit the same cache slot).
 *
 * The upstream HorizonService is injected explicitly to keep the cache
 * decoupled from the parent constructor's Guzzle client — tests can substitute
 * a mock upstream without going near Guzzle.
 */
class HorizonCache extends HorizonService
{
    public function __construct(SessionManager $session, private readonly HorizonService $upstream)
    {
        parent::__construct($session);
    }

    /**
     * @throws GuzzleException
     */
    public function horizonQuery(string $id, int $legStart, ?int $stepSize = null, ?int $duration = null): string|array|null
    {
        // Resolve defaults up front so the cache key is stable across callers.
        $stepSize = $stepSize ?? self::HORIZON_STEP_SIZE;
        $duration = $duration ?? self::HORIZON_DURATION;

        $key = "horizons-cache/$id-$legStart-$stepSize-$duration.json";

        if (Storage::disk('local')->exists($key)) {
            return json_decode(Storage::disk('local')->get($key), true);
        }

        $data = $this->upstream->horizonQuery($id, $legStart, $stepSize, $duration);

        // Only persist successful responses — upstream returns null on failure
        // and we don't want to poison the cache with empty stubs.
        if ($data !== null) {
            Storage::disk('local')->put($key, json_encode($data));
        }

        return $data;
    }
}
