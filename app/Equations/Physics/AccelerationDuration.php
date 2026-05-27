<?php

namespace App\Equations\Physics;

class AccelerationDuration
{
    /**
     * Returns the acceleration duration equation in MathJax format.
     *
     * @return string The acceleration duration equation.
     */
    public function equation(): string
    {
        return 't = \sqrt{\left(\frac{d^2}{c^2}\right) + \left(2 \cdot \frac{d}{a}\right)}';
    }

    /**
     * Returns the legend for the acceleration duration equation.
     *
     * @return array The legend explaining each symbol in the acceleration duration equation.
     */
    public function eqLegend(): array
    {
        return [
            't' => 'Acceleration duration',
            'd' => 'Acceleration distance',
            'c' => 'Speed of light',
            'a' => 'Acceleration',
        ];
    }

    /**
     * Calculate acceleration duration related values.
     *
     * @param  string  $desiredValue  The desired return value ('duration', 'distance', 'acceleration').
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
            case 'duration':
                return $this->calculateDuration($params->get('distance'), $params->get('acceleration'), $speedOfLight);
            case 'distance':
                return $this->calculateDistance($params->get('duration'), $params->get('acceleration'), $speedOfLight);
            case 'acceleration':
                return $this->calculateAcceleration($params->get('distance'), $params->get('duration'), $speedOfLight);
            default:
                // Debug
                DebugLog('info', 'Invalid desired value.', ['desiredValue' => $desiredValue], 'equations');

                return null;
        }
    }

    private function calculateDuration($distance, $acceleration, $speedOfLight): ?float
    {
        if ($distance !== null && $acceleration !== null) {
            return sqrt((pow($distance, 2) / pow($speedOfLight, 2)) + (2 * $distance / $acceleration));
        }

        return null;
    }

    private function calculateDistance($duration, $acceleration, $speedOfLight): ?float
    {
        if ($duration !== null && $acceleration !== null) {
            return ($speedOfLight * sqrt(pow($acceleration, 2) * pow($duration, 2) + 2 * $acceleration * pow($speedOfLight, 2)) - pow($speedOfLight, 2)) / (2 * $acceleration);
        }

        return null;
    }

    private function calculateAcceleration($distance, $duration, $speedOfLight): ?float
    {
        if ($distance !== null && $duration !== null) {
            return (pow($speedOfLight, 2) / $duration) / (sqrt(pow($distance, 2) + (2 * $distance * pow($speedOfLight, 2) / pow($duration, 2))));
        }

        return null;
    }
}
