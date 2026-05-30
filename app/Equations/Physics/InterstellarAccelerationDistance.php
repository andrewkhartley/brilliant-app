<?php

namespace App\Equations\Physics;

/**
 * Interstellar Acceleration Distance — coordinate distance covered
 * during the acceleration phase, given proper acceleration a and the
 * coordinate duration t of the acceleration burn.
 *
 * Lifted from Andrew Hartley's 2024 Undaunted prototype:
 * undaunted-app-2024-08-14/public/assets/js/calculators/Interstellar-App.js
 * (header: "Created by Andrew K. Hartley"), inside calcTripDetails():
 *
 *   let accelerationDistance =
 *       ((sol * sol) / tripAcceleration) *
 *       (Math.sqrt(1 + ((tripAcceleration * tripAcceleration *
 *                        accelerationDuration * accelerationDuration) /
 *                       (sol * sol))) - 1);
 *
 * This is the standard relativistic-rocket distance formula
 *   d = (c²/a) · (√(1 + (a·t/c)²) − 1)
 * which reduces to the Newtonian ½·a·t² at low velocities.
 */
class InterstellarAccelerationDistance
{
    /**
     * Returns the interstellar acceleration distance equation in MathJax format.
     */
    public function equation(): string
    {
        return 'd = \frac{c^{2}}{a} \left( \sqrt{1 + \left(\frac{a \cdot t}{c}\right)^{2}} - 1 \right)';
    }

    /**
     * Returns the legend for the interstellar acceleration distance equation.
     *
     * @return array<string, string>
     */
    public function eqLegend(): array
    {
        return [
            'd' => 'Coordinate distance covered during the acceleration phase',
            'c' => 'Speed of light',
            'a' => 'Constant proper acceleration',
            't' => 'Coordinate duration of the acceleration phase',
        ];
    }

    /**
     * Calculate the acceleration-phase coordinate distance.
     *
     * @param  string  $desiredValue  Currently only 'distance' is supported.
     * @param  array<int, array{0: string, 1: float|int|null}>  $parameters
     */
    public function calc(string $desiredValue, array $parameters): ?float
    {
        $speedOfLight = constants('c');

        $params = collect($parameters)->pluck('1', '0');

        switch ($desiredValue) {
            case 'distance':
                return $this->calculateDistance($params->get('acceleration'), $params->get('duration'), $speedOfLight);
            default:
                DebugLog('info', 'Invalid desired value.', ['desiredValue' => $desiredValue], 'equations');

                return null;
        }
    }

    private function calculateDistance($acceleration, $duration, $speedOfLight): ?float
    {
        if ($acceleration === null || $duration === null) {
            return null;
        }

        if ($acceleration <= 0.0) {
            return null;
        }

        return (($speedOfLight * $speedOfLight) / $acceleration)
            * (sqrt(1 + (($acceleration * $acceleration * $duration * $duration) / ($speedOfLight * $speedOfLight))) - 1);
    }
}
