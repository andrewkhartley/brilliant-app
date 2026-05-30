<?php

namespace App\Equations\Physics;

/**
 * Interstellar Proper Time (Acceleration Phase) — the time a traveler
 * onboard the ship experiences during the acceleration phase, given
 * the coordinate (Earth-frame) duration t and proper acceleration a.
 *
 * Lifted from Andrew Hartley's 2024 Undaunted prototype:
 * undaunted-app-2024-08-14/public/assets/js/calculators/Interstellar-App.js
 * (header: "Created by Andrew K. Hartley"), inside calcTripDetails():
 *
 *   let accelerationDurationDilation =
 *       sol / tripAcceleration *
 *       Math.asinh(tripAcceleration * accelerationDuration / sol);
 *
 * Algebraically:  τ = (c/a) · arcsinh(a · t / c).
 *
 * This is the proper time elapsed for an observer undergoing constant
 * proper acceleration a from rest to coordinate time t. PHP exposes
 * asinh() as a built-in, matching JS's Math.asinh().
 */
class InterstellarProperTimeAcceleration
{
    /**
     * Returns the equation in MathJax format.
     */
    public function equation(): string
    {
        return '\tau = \frac{c}{a} \cdot \operatorname{arcsinh}\!\left(\frac{a \cdot t}{c}\right)';
    }

    /**
     * Returns the legend for the equation.
     *
     * @return array<string, string>
     */
    public function eqLegend(): array
    {
        return [
            '\tau' => 'Proper (traveler) time during the acceleration phase',
            'c' => 'Speed of light',
            'a' => 'Constant proper acceleration',
            't' => 'Coordinate duration of the acceleration phase',
        ];
    }

    /**
     * Calculate the acceleration-phase proper time.
     *
     * @param  string  $desiredValue  Currently only 'properTime' is supported.
     * @param  array<int, array{0: string, 1: float|int|null}>  $parameters
     */
    public function calc(string $desiredValue, array $parameters): ?float
    {
        $speedOfLight = constants('c');

        $params = collect($parameters)->pluck('1', '0');

        switch ($desiredValue) {
            case 'properTime':
                return $this->calculateProperTime($params->get('acceleration'), $params->get('duration'), $speedOfLight);
            default:
                DebugLog('info', 'Invalid desired value.', ['desiredValue' => $desiredValue], 'equations');

                return null;
        }
    }

    private function calculateProperTime($acceleration, $duration, $speedOfLight): ?float
    {
        if ($acceleration === null || $duration === null) {
            return null;
        }

        if ($acceleration <= 0.0) {
            return null;
        }

        return ($speedOfLight / $acceleration) * asinh(($acceleration * $duration) / $speedOfLight);
    }
}
