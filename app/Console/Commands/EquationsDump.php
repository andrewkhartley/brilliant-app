<?php

namespace App\Console\Commands;

use App\Equations\Physics\AccelerationDuration;
use App\Equations\Physics\InterstellarAccelerationDistance;
use App\Equations\Physics\InterstellarAccelerationDuration;
use App\Equations\Physics\InterstellarEffectiveExhaustVelocity;
use App\Equations\Physics\InterstellarFuelMassRatio;
use App\Equations\Physics\InterstellarProperTimeAcceleration;
use App\Equations\Physics\InterstellarProperTimeCruise;
use App\Equations\Physics\InterstellarTripDuration;
use App\Equations\Physics\InterstellarTripDurationDilation;
use App\Equations\Physics\OrbitalPeriod;
use App\Equations\Physics\OrbitalVelocity;
use App\Equations\Physics\RelativisticSpeed;
use Illuminate\Console\Command;

/**
 * Dumps PHP-computed equation outputs to a JSON fixture that Vitest reads
 * for TS-vs-PHP parity testing.
 *
 * Re-run this command whenever a Phase 2-lifted equation class's compute
 * logic changes. The fixture is committed to git; the diff makes drift
 * visible in PR review.
 */
class EquationsDump extends Command
{
    protected $signature = 'equations:dump';

    protected $description = 'Dump PHP equation outputs to tests/fixtures/equations-parity.json for TS parity tests';

    public function handle(): int
    {
        $relativisticSpeed = new RelativisticSpeed;
        $orbitalPeriod = new OrbitalPeriod;
        $orbitalVelocity = new OrbitalVelocity;
        $accelerationDuration = new AccelerationDuration;
        $interstellarAccelerationDuration = new InterstellarAccelerationDuration;
        $interstellarAccelerationDistance = new InterstellarAccelerationDistance;
        $interstellarProperTimeAcceleration = new InterstellarProperTimeAcceleration;
        $interstellarProperTimeCruise = new InterstellarProperTimeCruise;
        $interstellarTripDuration = new InterstellarTripDuration;
        $interstellarTripDurationDilation = new InterstellarTripDurationDilation;
        $interstellarEffectiveExhaustVelocity = new InterstellarEffectiveExhaustVelocity;
        $interstellarFuelMassRatio = new InterstellarFuelMassRatio;

        // Reference figures used by multiple fixture cases:
        //   • Proxima Centauri ≈ 4.24 light years = 4.0114 × 10¹⁶ m
        //   • Andrew's Undaunted default: 4.25 ly ≈ 4.0208 × 10¹⁶ m
        //   • 1 g ≈ 9.80665 m/s²; 0.1 g ≈ 0.980665 m/s²
        //   • 0.25c ≈ 7.4948 × 10⁷ m/s (Andrew's default cruise speed)

        $fixture = [
            'relativistic-speed' => [
                $this->case(['a' => 9.80665, 't' => 86400], $relativisticSpeed->calc('maximumSpeed', [['acceleration', 9.80665], ['duration', 86400]])),
                $this->case(['a' => 9.80665, 't' => 31_536_000], $relativisticSpeed->calc('maximumSpeed', [['acceleration', 9.80665], ['duration', 31_536_000]])),
                $this->case(['a' => 1, 't' => 1], $relativisticSpeed->calc('maximumSpeed', [['acceleration', 1], ['duration', 1]])),
                $this->case(['a' => 100, 't' => 1e6], $relativisticSpeed->calc('maximumSpeed', [['acceleration', 100], ['duration', 1e6]])),
            ],
            'orbital-period' => [
                $this->case(['r' => 6.778e6, 'v' => 7660], $orbitalPeriod->calc('period', [['radius', 6.778e6], ['velocity', 7660]])),
                $this->case(['r' => 1.496e11, 'v' => 29780], $orbitalPeriod->calc('period', [['radius', 1.496e11], ['velocity', 29780]])),
                $this->case(['r' => 1e3, 'v' => 1], $orbitalPeriod->calc('period', [['radius', 1e3], ['velocity', 1]])),
            ],
            'orbital-velocity' => [
                $this->case(['M' => 5.972e24, 'r' => 6.778e6], $orbitalVelocity->calc('velocity', [['mass', 5.972e24], ['radius', 6.778e6]])),
                $this->case(['M' => 1.989e30, 'r' => 1.496e11], $orbitalVelocity->calc('velocity', [['mass', 1.989e30], ['radius', 1.496e11]])),
                $this->case(['M' => 7.342e22, 'r' => 1.737e6], $orbitalVelocity->calc('velocity', [['mass', 7.342e22], ['radius', 1.737e6]])),
            ],
            'acceleration-duration' => [
                $this->case(['d' => 3.844e8, 'a' => 9.80665], $accelerationDuration->calc('duration', [['distance', 3.844e8], ['acceleration', 9.80665]])),
                $this->case(['d' => 1.496e11, 'a' => 9.80665], $accelerationDuration->calc('duration', [['distance', 1.496e11], ['acceleration', 9.80665]])),
                $this->case(['d' => 1, 'a' => 1], $accelerationDuration->calc('duration', [['distance', 1], ['acceleration', 1]])),
            ],
            'interstellar-acceleration-duration' => [
                // 0.25c at 0.1g — Andrew's Undaunted default cruise target.
                $this->case(['v' => 7.4948114e7, 'a' => 0.980665], $interstellarAccelerationDuration->calc('duration', [['maximumSpeed', 7.4948114e7], ['acceleration', 0.980665]])),
                // 0.5c at 1g.
                $this->case(['v' => 1.49896229e8, 'a' => 9.80665], $interstellarAccelerationDuration->calc('duration', [['maximumSpeed', 1.49896229e8], ['acceleration', 9.80665]])),
                // Low-velocity Newtonian regime (γ ≈ 1, so t ≈ v/a).
                $this->case(['v' => 1000, 'a' => 1], $interstellarAccelerationDuration->calc('duration', [['maximumSpeed', 1000], ['acceleration', 1]])),
            ],
            'interstellar-acceleration-distance' => [
                // Newtonian regime: ½·a·t² ≈ 49.0 m.
                $this->case(['a' => 9.80665, 't' => 10], $interstellarAccelerationDistance->calc('distance', [['acceleration', 9.80665], ['duration', 10]])),
                // 0.1g for ~7.91 years (the time to reach 0.25c at 0.1g, coordinate frame).
                $this->case(['a' => 0.980665, 't' => 2.495e8], $interstellarAccelerationDistance->calc('distance', [['acceleration', 0.980665], ['duration', 2.495e8]])),
                // 1g for one year (coordinate frame).
                $this->case(['a' => 9.80665, 't' => 31_536_000], $interstellarAccelerationDistance->calc('distance', [['acceleration', 9.80665], ['duration', 31_536_000]])),
            ],
            'interstellar-proper-time-acceleration' => [
                // 1g for one Earth year of coordinate time → ~0.873 yr proper.
                $this->case(['a' => 9.80665, 't' => 31_536_000], $interstellarProperTimeAcceleration->calc('properTime', [['acceleration', 9.80665], ['duration', 31_536_000]])),
                // 0.1g for ~7.91 years coordinate (the 0.25c time-to-cruise from Andrew's default).
                $this->case(['a' => 0.980665, 't' => 2.495e8], $interstellarProperTimeAcceleration->calc('properTime', [['acceleration', 0.980665], ['duration', 2.495e8]])),
                // Newtonian regime sanity: τ ≈ t for tiny a·t/c.
                $this->case(['a' => 1, 't' => 1000], $interstellarProperTimeAcceleration->calc('properTime', [['acceleration', 1], ['duration', 1000]])),
            ],
            'interstellar-proper-time-cruise' => [
                // 1 light-year of cruise at 0.25c.
                $this->case(['d' => 9.461e15, 'v' => 7.4948114e7], $interstellarProperTimeCruise->calc('properTime', [['distance', 9.461e15], ['velocity', 7.4948114e7]])),
                // 1 light-year of cruise at 0.9c (heavy dilation).
                $this->case(['d' => 9.461e15, 'v' => 2.69813212e8], $interstellarProperTimeCruise->calc('properTime', [['distance', 9.461e15], ['velocity', 2.69813212e8]])),
                // Newtonian-regime sanity check: τ ≈ d/v at low v.
                $this->case(['d' => 1e6, 'v' => 1000], $interstellarProperTimeCruise->calc('properTime', [['distance', 1e6], ['velocity', 1000]])),
            ],
            'interstellar-trip-duration' => $this->tripDurationCases(
                fn (array $params): ?float => $interstellarTripDuration->calc('tripDuration', $params)
            ),
            'interstellar-trip-duration-dilation' => $this->tripDurationCases(
                fn (array $params): ?float => $interstellarTripDurationDilation->calc('tripDuration', $params)
            ),
            'interstellar-effective-exhaust-velocity' => [
                // Matter-antimatter at η=1 → v_e ≈ 0.866c.
                $this->case(['specificEnergy' => 8.9875517874e16, 'efficiency' => 1.0], $interstellarEffectiveExhaustVelocity->calc('effectiveExhaustVelocity', [['specificEnergy', 8.9875517874e16], ['efficiency', 1.0]])),
                // Matter-antimatter at η=0.5 → γ = 1.5, v_e ≈ c·√(5/9).
                $this->case(['specificEnergy' => 8.9875517874e16, 'efficiency' => 0.5], $interstellarEffectiveExhaustVelocity->calc('effectiveExhaustVelocity', [['specificEnergy', 8.9875517874e16], ['efficiency', 0.5]])),
                // D-T fusion at η=1 → v_e ≪ c (sub-relativistic regime).
                $this->case(['specificEnergy' => 3.38e14, 'efficiency' => 1.0], $interstellarEffectiveExhaustVelocity->calc('effectiveExhaustVelocity', [['specificEnergy', 3.38e14], ['efficiency', 1.0]])),
                // U-235 fission at η=1 → v_e ≪ c.
                $this->case(['specificEnergy' => 1.44e14, 'efficiency' => 1.0], $interstellarEffectiveExhaustVelocity->calc('effectiveExhaustVelocity', [['specificEnergy', 1.44e14], ['efficiency', 1.0]])),
                // Zero efficiency → zero exhaust velocity.
                $this->case(['specificEnergy' => 8.9875517874e16, 'efficiency' => 0.0], $interstellarEffectiveExhaustVelocity->calc('effectiveExhaustVelocity', [['specificEnergy', 8.9875517874e16], ['efficiency', 0.0]])),
            ],
            'interstellar-fuel-mass-ratio' => [
                // Antimatter v_e (~0.866c), one-way fly-by at 0.25c (Δv = 0.25c).
                $this->case(['deltaV' => 7.4948114e7, 'effectiveExhaustVelocity' => 2.59624e8], $interstellarFuelMassRatio->calc('massRatio', [['deltaV', 7.4948114e7], ['effectiveExhaustVelocity', 2.59624e8]])),
                // Antimatter v_e, round-trip-with-stop Δv = 0.5c.
                $this->case(['deltaV' => 1.49896229e8, 'effectiveExhaustVelocity' => 2.59624e8], $interstellarFuelMassRatio->calc('massRatio', [['deltaV', 1.49896229e8], ['effectiveExhaustVelocity', 2.59624e8]])),
                // Classical-regime sanity: Δv = 1000 m/s, v_e = 4500 m/s
                // (chemical rocket); relativistic form reduces to e^(Δv/v_e) ≈ 1.246.
                $this->case(['deltaV' => 1000, 'effectiveExhaustVelocity' => 4500], $interstellarFuelMassRatio->calc('massRatio', [['deltaV', 1000], ['effectiveExhaustVelocity', 4500]])),
                // Asymptotic guard: Δv ≥ c.
                $this->case(['deltaV' => 3e8, 'effectiveExhaustVelocity' => 2.59624e8], $interstellarFuelMassRatio->calc('massRatio', [['deltaV', 3e8], ['effectiveExhaustVelocity', 2.59624e8]])),
            ],
        ];

        $path = base_path('tests/fixtures/equations-parity.json');
        if (! is_dir(dirname($path))) {
            mkdir(dirname($path), 0755, true);
        }
        file_put_contents($path, json_encode($fixture, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)."\n");

        $this->info("Fixture written to $path");
        $caseCount = array_sum(array_map('count', $fixture));
        $this->info(count($fixture).' equations, '.$caseCount.' total cases.');

        return self::SUCCESS;
    }

    /**
     * Wrap one equation call's inputs + expected output for the fixture.
     *
     * JSON cannot natively represent ±Infinity (json_encode returns
     * false on INF). We map INF to the sentinel string "Infinity" so
     * the TS parity tests (Phase 8 T4.7) can deserialize it back to
     * Number.POSITIVE_INFINITY for comparison.
     *
     * @param  array<string, float|int|bool>  $inputs
     * @return array{inputs: array<string, float|int|bool>, expected: float|string|null}
     */
    private function case(array $inputs, float|string|null $expected): array
    {
        if (is_float($expected) && is_infinite($expected)) {
            $expected = $expected > 0 ? 'Infinity' : '-Infinity';
        }

        return ['inputs' => $inputs, 'expected' => $expected];
    }

    /**
     * Build the shared 4-case fixture set for the interstellar trip
     * duration equations. Both InterstellarTripDuration (Earth-frame)
     * and InterstellarTripDurationDilation (proper-time) share these
     * inputs — the only difference is which compute method runs against
     * them. The caller supplies the calculation as a closure so this
     * helper stays equation-agnostic.
     *
     * @param  callable(array<int, array{0: string, 1: float|int|bool}>): ?float  $calculate
     * @return array<int, array{inputs: array<string, float|int|bool>, expected: float|string|null}>
     */
    private function tripDurationCases(callable $calculate): array
    {
        $fixtures = [
            // Andrew's Undaunted default: 4.25 ly, 0.25c, 0.1g, stop.
            ['distance' => 4.0208104508468400e16, 'acceleration' => 0.980665, 'maximumSpeed' => 7.4948114e7, 'stop' => true],
            // Same trip, fly-by (no stop).
            ['distance' => 4.0208104508468400e16, 'acceleration' => 0.980665, 'maximumSpeed' => 7.4948114e7, 'stop' => false],
            // Proxima Centauri (4.24 ly) at 1g with high cruise (0.5c), stop.
            ['distance' => 4.0114e16, 'acceleration' => 9.80665, 'maximumSpeed' => 1.49896229e8, 'stop' => true],
            // No-cruise scenario: short trip where accel distance > half-trip.
            ['distance' => 1e12, 'acceleration' => 9.80665, 'maximumSpeed' => 2.5e8, 'stop' => true],
        ];

        return array_map(function (array $fixture) use ($calculate) {
            $params = collect($fixture)
                ->map(fn ($value, $key) => [$key, $value])
                ->values()
                ->all();

            $displayInputs = [
                'd' => $fixture['distance'],
                'a' => $fixture['acceleration'],
                'vMax' => $fixture['maximumSpeed'],
                'stop' => $fixture['stop'],
            ];

            return $this->case($displayInputs, $calculate($params));
        }, $fixtures);
    }
}
