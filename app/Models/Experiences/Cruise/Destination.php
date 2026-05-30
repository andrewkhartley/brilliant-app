<?php

namespace App\Models\Experiences\Cruise;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

/**
 * Solar System Facts — lifted reference data for Cruise destinations.
 * Schema mirrors `database/migrations/0001_01_01_000003_create_solar_system_facts_table.php`.
 *
 * @property int $id
 * @property string $destination_code 3-char planet code (sun, mer, ven, ear, mar, jup, sat, ura, nep, plu, obs)
 * @property string $destination Human-readable name (e.g. "Mercury")
 * @property bool $horizons Whether this body is queryable via NASA Horizons
 * @property int $horizons_id NASA Horizons body ID (e.g. 199 for Mercury)
 * @property int $x_coord
 * @property int $y_coord
 * @property int $z_coord
 * @property bool $orbital
 * @property string $solar_orbit decimal(10,5)
 * @property string $orbital_period decimal(10,5)
 * @property float $orbital_altitude
 * @property float $mass
 * @property float $radius
 * @property float $tilt
 * @property float $right_asc
 * @property int $perihelion
 * @property int $aphelion
 * @property int $offset
 * @property string $axis_len decimal(10,8)
 * @property string $eccentricity decimal(9,8)
 * @property string $inclination decimal(7,5)
 * @property string $long_asc decimal(8,5)
 * @property string $long_peri decimal(8,5)
 * @property string $long_mean decimal(8,5)
 * @property string $axis_len_corr decimal(9,8)
 * @property string $eccentricity_corr decimal(9,8)
 * @property string $inclination_corr decimal(4,0)
 * @property string $long_asc_corr decimal(7,0)
 * @property string $long_peri_corr decimal(6,0)
 * @property string $long_mean_corr decimal(11,0)
 *
 * @method static int count()
 * @method static Builder<self> query()
 * @method static Collection<int, self> all()
 */
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
