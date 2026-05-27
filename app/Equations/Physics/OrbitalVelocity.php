<?php

namespace App\Equations\Physics;

class OrbitalVelocity
{
    /**
     * Returns the orbital velocity equation in MathJax format.
     *
     * @return string The orbital velocity equation.
     */
    public function equation(): string
    {
        return 'v = \sqrt{\frac{GM}{r}}';
    }

    /**
     * Returns the legend for the orbital velocity equation.
     *
     * @return array The legend explaining each symbol in the orbital velocity equation.
     */
    public function eqLegend(): array
    {
        return [
            'v' => 'Orbital velocity',
            'G' => 'Gravitational constant',
            'M' => 'Mass of the celestial body',
            'r' => 'Orbital radius from the center of the body',
        ];
    }

    /**
     * Calculate orbital velocity related values.
     *
     * @param  string  $desiredValue  The desired return value ('velocity', 'mass', or 'radius').
     * @param  array  $parameters  Array of input parameters.
     * @return float|null The calculated value or null if insufficient data.
     */
    public function calc(string $desiredValue, array $parameters): ?float
    {
        // Parsing input parameters
        $params = collect($parameters)->pluck('1', '0');

        // Calculating based on desired value
        switch ($desiredValue) {
            case 'velocity':
                return $this->calculateVelocity($params->get('mass'), $params->get('radius'));
            case 'mass':
                return $this->calculateMass($params->get('velocity'), $params->get('radius'));
            case 'radius':
                return $this->calculateRadius($params->get('velocity'), $params->get('mass'));
            default:
                // Debug
                DebugLog('info', 'Invalid desired value.', ['desiredValue' => $desiredValue], 'equations');

                return null;
        }
    }

    // Calculate Outputs
    private function calculateVelocity($mass, $radius): ?float
    {
        return isset($mass, $radius) ? sqrt(constants('G') * $mass / $radius) : null;
    }

    private function calculateMass($velocity, $radius): ?float
    {
        return isset($velocity, $radius) ? ($velocity * $velocity * $radius) / constants('G') : null;
    }

    private function calculateRadius($velocity, $mass): ?float
    {
        return isset($velocity, $mass) ? (constants('G') * $mass) / ($velocity * $velocity) : null;
    }
}
