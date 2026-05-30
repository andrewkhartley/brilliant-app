<?php

namespace App\Equations\Physics;

/**
 * Interstellar Acceleration Duration — coordinate time required to
 * reach a target maximum velocity at constant proper acceleration.
 *
 * Lifted from Andrew Hartley's 2024 Undaunted prototype:
 * undaunted-app-2024-08-14/public/assets/js/calculators/Interstellar-App.js
 * (header: "Created by Andrew K. Hartley"), inside calcTripDetails():
 *
 *   let accelerationDuration =
 *       (sol * tripMaxSpeed) /
 *       Math.sqrt(
 *           (tripAcceleration * tripAcceleration * sol * sol) -
 *           (tripMaxSpeed * tripMaxSpeed * tripAcceleration * tripAcceleration)
 *       );
 *
 * Algebraically this is t = v / (a · √(1 − v²/c²)) = (v/a) · γ, the
 * coordinate (Earth-frame) time needed for an observer at rest to see
 * the ship reach v under constant proper acceleration a.
 */
class InterstellarAccelerationDuration
{
    /**
     * Returns the interstellar acceleration duration equation in MathJax format.
     */
    public function equation(): string
    {
        return 't = \frac{c \cdot v}{\sqrt{a^{2} c^{2} - v^{2} a^{2}}}';
    }

    /**
     * Returns the legend for the interstellar acceleration duration equation.
     *
     * @return array<string, string>
     */
    public function eqLegend(): array
    {
        return [
            't' => 'Coordinate time during the acceleration phase',
            'c' => 'Speed of light',
            'v' => 'Target maximum velocity',
            'a' => 'Constant proper acceleration',
        ];
    }

    /**
     * Calculate the acceleration-phase coordinate duration.
     *
     * @param  string  $desiredValue  Currently only 'duration' is supported.
     * @param  array<int, array{0: string, 1: float|int|null}>  $parameters
     */
    public function calc(string $desiredValue, array $parameters): ?float
    {
        $speedOfLight = constants('c');

        $params = collect($parameters)->pluck('1', '0');

        switch ($desiredValue) {
            case 'duration':
                return $this->calculateDuration($params->get('maximumSpeed'), $params->get('acceleration'), $speedOfLight);
            default:
                DebugLog('info', 'Invalid desired value.', ['desiredValue' => $desiredValue], 'equations');

                return null;
        }
    }

    private function calculateDuration($maximumSpeed, $acceleration, $speedOfLight): ?float
    {
        if ($maximumSpeed === null || $acceleration === null) {
            return null;
        }

        // Guard: v ≥ c is unphysical; γ blows up.
        if ($maximumSpeed >= $speedOfLight) {
            return INF;
        }

        $denominator = sqrt(
            ($acceleration * $acceleration * $speedOfLight * $speedOfLight)
            - ($maximumSpeed * $maximumSpeed * $acceleration * $acceleration)
        );

        if ($denominator <= 0.0) {
            return INF;
        }

        return ($speedOfLight * $maximumSpeed) / $denominator;
    }
}
