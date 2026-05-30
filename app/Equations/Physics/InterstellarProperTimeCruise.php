<?php

namespace App\Equations\Physics;

/**
 * Interstellar Proper Time (Cruise Phase) — the time a traveler
 * onboard the ship experiences during the constant-velocity cruise
 * phase, given cruise distance d and cruise velocity v.
 *
 * Lifted from Andrew Hartley's 2024 Undaunted prototype:
 * undaunted-app-2024-08-14/public/assets/js/calculators/Interstellar-App.js
 * (header: "Created by Andrew K. Hartley"), inside calcTripDetails():
 *
 *   cruiseDurationDilation =
 *       cruiseDistance / tripMaxSpeed *
 *       Math.sqrt(1 - ((tripMaxSpeed * tripMaxSpeed) / (sol * sol)));
 *
 * Algebraically:  τ = (d/v) · √(1 − v²/c²) = (d/v) / γ.
 *
 * At low v this approaches the Newtonian d/v; at relativistic v the
 * traveler's experienced time shortens by a factor of 1/γ.
 */
class InterstellarProperTimeCruise
{
    /**
     * Returns the equation in MathJax format.
     */
    public function equation(): string
    {
        return '\tau = \frac{d}{v} \cdot \sqrt{1 - \frac{v^{2}}{c^{2}}}';
    }

    /**
     * Returns the legend for the equation.
     *
     * @return array<string, string>
     */
    public function eqLegend(): array
    {
        return [
            '\tau' => 'Proper (traveler) time during the cruise phase',
            'd' => 'Cruise distance (coordinate frame)',
            'v' => 'Cruise velocity',
            'c' => 'Speed of light',
        ];
    }

    /**
     * Calculate the cruise-phase proper time.
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
                return $this->calculateProperTime($params->get('distance'), $params->get('velocity'), $speedOfLight);
            default:
                DebugLog('info', 'Invalid desired value.', ['desiredValue' => $desiredValue], 'equations');

                return null;
        }
    }

    private function calculateProperTime($distance, $velocity, $speedOfLight): ?float
    {
        if ($distance === null || $velocity === null) {
            return null;
        }

        // Zero-distance cruise (no-cruise scenario) → zero proper time.
        if ($distance == 0.0) {
            return 0.0;
        }

        if ($velocity <= 0.0) {
            return null;
        }

        if ($velocity >= $speedOfLight) {
            return 0.0;
        }

        return ($distance / $velocity) * sqrt(1 - (($velocity * $velocity) / ($speedOfLight * $speedOfLight)));
    }
}
