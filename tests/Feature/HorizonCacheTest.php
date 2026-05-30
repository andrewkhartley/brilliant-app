<?php

/** @noinspection PhpUnhandledExceptionInspection — HorizonService::horizonQuery declares @throws GuzzleException; in these tests the upstream is always Mockery-mocked so the exception is never actually thrown. PHPStorm's static analysis can't see through the mock. */

use App\Services\API\HorizonCache;
use App\Services\API\HorizonService;
use App\Services\Sessions\SessionManager;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('local');
});

it('returns upstream response on cache miss and writes the file', function () {
    $upstream = Mockery::mock(HorizonService::class);
    $upstream->shouldReceive('horizonQuery')
        ->once()
        ->with('399', 1735689600, 1440, 30)
        ->andReturn(['id' => '399', 'entries' => 1, 'data' => [['timestamp' => '2025-01-01', 'x' => '1', 'y' => '2', 'z' => '3']]]);

    $cache = new HorizonCache(app(SessionManager::class), $upstream);
    $result = $cache->horizonQuery('399', 1735689600, 1440, 30);

    expect($result)->toBe([
        'id' => '399',
        'entries' => 1,
        'data' => [['timestamp' => '2025-01-01', 'x' => '1', 'y' => '2', 'z' => '3']],
    ]);
    Storage::disk('local')->assertExists('horizons-cache/399-1735689600-1440-30.json');
});

it('returns cached response without calling upstream', function () {
    $cached = ['id' => '399', 'entries' => 0, 'data' => []];
    Storage::disk('local')->put(
        'horizons-cache/399-1735689600-1440-30.json',
        json_encode($cached)
    );

    $upstream = Mockery::mock(HorizonService::class);
    $upstream->shouldNotReceive('horizonQuery');

    $cache = new HorizonCache(app(SessionManager::class), $upstream);
    $result = $cache->horizonQuery('399', 1735689600, 1440, 30);

    expect($result)->toBe($cached);
});

it('resolves default step size and duration so omitted args share a cache slot', function () {
    $upstream = Mockery::mock(HorizonService::class);
    // The expected arg list normalizes nulls to the HorizonService defaults
    // (HORIZON_STEP_SIZE = 1440, HORIZON_DURATION = 3600 * 24 = 86400).
    $upstream->shouldReceive('horizonQuery')
        ->once()
        ->with('499', 1735689600, 1440, 86400)
        ->andReturn(['id' => '499', 'data' => []]);

    $cache = new HorizonCache(app(SessionManager::class), $upstream);
    $first = $cache->horizonQuery('499', 1735689600);

    Storage::disk('local')->assertExists('horizons-cache/499-1735689600-1440-86400.json');

    // Second call with explicit defaults should hit the same cache file.
    $upstreamHit = Mockery::mock(HorizonService::class);
    $upstreamHit->shouldNotReceive('horizonQuery');
    $cacheHit = new HorizonCache(app(SessionManager::class), $upstreamHit);
    $second = $cacheHit->horizonQuery('499', 1735689600, 1440, 86400);

    expect($second)->toBe($first);
});

it('does not poison the cache when upstream returns null', function () {
    $upstream = Mockery::mock(HorizonService::class);
    $upstream->shouldReceive('horizonQuery')
        ->once()
        ->andReturn(null);

    $cache = new HorizonCache(app(SessionManager::class), $upstream);
    $result = $cache->horizonQuery('599', 1735689600, 1440, 86400);

    expect($result)->toBeNull();
    Storage::disk('local')->assertMissing('horizons-cache/599-1735689600-1440-86400.json');
});

it('preserves nested array shapes through the JSON roundtrip on cache hit', function () {
    $cached = [
        'id' => '599',
        'stepSize' => 1440,
        'duration' => 1,
        'entries' => 2,
        'data' => [
            ['timestamp' => '2026-01-01 00:00', 'x' => '7.43e+8', 'y' => '-1.23e+8', 'z' => '-2.05e+7'],
            ['timestamp' => '2026-01-02 00:00', 'x' => '7.44e+8', 'y' => '-1.22e+8', 'z' => '-2.05e+7'],
        ],
    ];
    Storage::disk('local')->put(
        'horizons-cache/599-1735689600-1440-86400.json',
        json_encode($cached)
    );

    $upstream = Mockery::mock(HorizonService::class);
    $upstream->shouldNotReceive('horizonQuery');

    $cache = new HorizonCache(app(SessionManager::class), $upstream);
    $result = $cache->horizonQuery('599', 1735689600, 1440, 86400);

    expect($result)->toBe($cached)
        ->and($result['data'])->toHaveCount(2)
        ->and($result['data'][0]['x'])->toBe('7.43e+8');
});
