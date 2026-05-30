<?php

namespace App\Models\Experiences\Cruise;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class Destination extends Model
{
    // Data Mapping — uses the default SQLite connection (Phase 10 T1
    // dropped the legacy `scales-systems` named connection; this is
    // the first DB-backed domain table in the Brilliant v1 build).
    protected $table = 'solar_system_facts';

    // Mass assignable attributes
    protected $fillable = [
        'destination_code',
        'destination',
        'horizons',
        'horizons_id',
        'x_coord',
        'y_coord',
        'z_coord',
        'orbital',
        'solar_orbit',
        'orbital_period',
        'orbital_altitude',
        'mass',
        'radius',
        'tilt',
        'right_asc',
        'perihelion',
        'aphelion',
        'offset',
        'axis_len',
        'eccentricity',
        'inclination',
        'long_asc',
        'long_peri',
        'long_mean',
        'axis_len_corr',
        'eccentricity_corr',
        'inclination_corr',
        'long_asc_corr',
        'long_peri_corr',
        'long_mean_corr',
    ];

    /**
     * Retrieve all solar system facts with caching.
     *
     * @return Collection<int, self>
     */
    public static function getCachedFacts(): Collection
    {
        // Define a unique key for the cache
        $cacheKey = 'solarSystemFacts.all';

        // Define the duration for the cache (in seconds or use Carbon for more readability)
        $cacheDuration = now()->addHours(24);

        // Retrieve the data from cache or store if not present
        return Cache::remember($cacheKey, $cacheDuration, function () {
            return self::all();
        });
    }
}
