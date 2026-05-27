<?php

namespace App\Equations\Physics;

class OrbitalPeriod
{
    /**
     * Returns the orbital period equation in MathJax format.
     *
     * @return string The orbital period equation.
     */
    public function equation(): string
    {
        return 'T = \frac{2 \pi r}{v}';
    }

    /**
     * Returns the legend for the orbital period equation.
     *
     * @return array The legend explaining each symbol in the orbital period equation.
     */
    public function eqLegend(): array
    {
        return [
            'T' => 'Orbital period',
            'r' => 'Orbital radius from the center of the celestial body',
            'v' => 'Orbital velocity at the given radius',
        ];
    }

    /**
     * Calculate orbital period related values.
     *
     * @param  string  $desiredValue  The desired return value ('velocity', 'radius', 'period').
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
                return $this->calculateVelocity($params->get('radius'), $params->get('period'));
            case 'radius':
                return $this->calculateRadius($params->get('velocity'), $params->get('period'));
            case 'period':
                return $this->calculatePeriod($params->get('velocity'), $params->get('radius'));
            default:
                // Debug
                DebugLog('info', 'Invalid desired value.', ['desiredValue' => $desiredValue], 'equations');

                return null;
        }
    }

    // Calculate Outputs
    private function calculateVelocity($radius, $period): ?float
    {
        return $radius && $period ? (2 * pi() * $radius) / $period : null;
    }

    private function calculateRadius($velocity, $period): ?float
    {
        return $velocity && $period ? $velocity * $period / (2 * pi()) : null;
    }

    private function calculatePeriod($velocity, $radius): ?float
    {
        return $velocity && $radius ? (2 * pi() * $radius) / $velocity : null;
    }
}
