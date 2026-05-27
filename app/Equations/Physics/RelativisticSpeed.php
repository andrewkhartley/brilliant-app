<?php

namespace App\Equations\Physics;

class RelativisticSpeed
{
    /**
     * Returns the relativistic speed equation in MathJax format.
     *
     * @return string The relativistic speed equation.
     */
    public function equation(): string
    {
        return 'v = \frac{a \cdot t}{\sqrt{1 + \left(\frac{a \cdot t}{c}\right)^2}}';
    }

    /**
     * Returns the legend for the relativistic speed equation.
     *
     * @return array The legend explaining each symbol in the relativistic speed equation.
     */
    public function eqLegend(): array
    {
        return [
            'v' => 'Maximum speed (leg max speed)',
            'a' => 'Acceleration',
            't' => 'Acceleration duration',
            'c' => 'Speed of light',
        ];
    }

    /**
     * Calculate relativistic speed or related values.
     *
     * @param  string  $desiredValue  The desired return value ('maximumSpeed', 'acceleration', 'duration').
     * @param  array  $parameters  Array of input parameters.
     * @return float|null The calculated value or null if insufficient data.
     */
    public function calc(string $desiredValue, array $parameters): ?float
    {

        // Constants
        $speedOfLight = constants('c');

        // Parsing input parameters
        $params = collect($parameters)->pluck('1', '0');

        switch ($desiredValue) {
            case 'maximumSpeed':
                return $this->calculateMaximumSpeed($params->get('acceleration'), $params->get('duration'), $speedOfLight);
            case 'acceleration':
                return $this->calculateAcceleration($params->get('maximumSpeed'), $params->get('duration'), $speedOfLight);
            case 'duration':
                return $this->calculateDuration($params->get('acceleration'), $params->get('maximumSpeed'), $speedOfLight);
            default:
                // Debug
                DebugLog('info', 'Invalid desired value.', ['desiredValue' => $desiredValue], 'equations');

                return null;
        }
    }

    private function calculateMaximumSpeed($acceleration, $duration, $speedOfLight): ?float
    {
        if ($acceleration !== null && $duration !== null) {
            return ($acceleration * $duration) / sqrt(1 + pow(($acceleration * $duration / $speedOfLight), 2));
        }

        return null;
    }

    private function calculateAcceleration($maximumSpeed, $duration, $speedOfLight): ?float
    {
        if ($maximumSpeed !== null && $duration !== null) {
            return $maximumSpeed / ($duration / sqrt(1 - pow(($maximumSpeed / $speedOfLight), 2)));
        }

        return null;
    }

    private function calculateDuration($acceleration, $maximumSpeed, $speedOfLight): ?float
    {
        if ($acceleration !== null && $maximumSpeed !== null) {
            return $maximumSpeed / ($acceleration * sqrt(1 - pow(($maximumSpeed / $speedOfLight), 2)));
        }

        return null;
    }
}
