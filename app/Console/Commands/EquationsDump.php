<?php

namespace App\Console\Commands;

use App\Equations\Physics\AccelerationDuration;
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
     * @param  array<string, float|int>  $inputs
     * @return array{inputs: array<string, float|int>, expected: float|null}
     */
    private function case(array $inputs, ?float $expected): array
    {
        return ['inputs' => $inputs, 'expected' => $expected];
    }
}
