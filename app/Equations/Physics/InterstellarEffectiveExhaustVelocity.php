<?php

namespace App\Equations\Physics;

/**
 * Interstellar Effective Exhaust Velocity — the relativistic-aware
 * effective exhaust velocity v_e of a propulsion system given its
 * fuel's specific energy E_s (J/kg) and a conversion efficiency η.
 *
 * NEW derivation for Brilliant Phase 8 — this equation is NOT in
 * Andrew Hartley's 2024 Undaunted prototype. It is needed to feed
 * the Tsiolkovsky relativistic rocket equation (see
 * InterstellarFuelMassRatio) for the fuel-budget visualization.
 *
 * Derivation:
 *   Let η be the fraction of fuel specific energy E_s that becomes
 *   exhaust kinetic energy. The relativistic kinetic energy per unit
 *   mass of exhaust is (γ − 1)·c², so:
 *
 *       (γ − 1)·c² = η·E_s
 *       γ          = 1 + (η·E_s / c²)
 *       v_e        = c · √(1 − 1/γ²)
 *
 * Why relativistic and not classical:
 *   The classical Newtonian form v_e = √(2·η·E_s) silently exceeds c
 *   when η·E_s approaches c² — which is exactly the regime
 *   matter-antimatter annihilation lives in (E_s ≈ 8.988 × 10¹⁶ J/kg,
 *   so η·E_s ≈ c² at η = 1). The relativistic formula above is
 *   mandatory whenever the fuel's per-kg energy is comparable to c².
 *
 * Sanity check (used in tests):
 *   Antimatter at η = 1: γ = 2, so v_e = c · √(3/4) ≈ 0.866c.
 */
class InterstellarEffectiveExhaustVelocity
{
    /**
     * Returns the equation in MathJax format.
     */
    public function equation(): string
    {
        return 'v_{e} = c \cdot \sqrt{1 - \frac{1}{\gamma^{2}}}, \quad \gamma = 1 + \frac{\eta \cdot E_{s}}{c^{2}}';
    }

    /**
     * Returns the legend for the equation.
     *
     * @return array<string, string>
     */
    public function eqLegend(): array
    {
        return [
            'v_{e}' => 'Effective exhaust velocity',
            'c' => 'Speed of light',
            '\gamma' => 'Lorentz factor of the exhaust',
            '\eta' => 'Energy-conversion efficiency (0–1)',
            'E_{s}' => 'Specific energy of the fuel (J/kg)',
        ];
    }

    /**
     * Calculate the effective exhaust velocity.
     *
     * @param  string  $desiredValue  Currently only 'effectiveExhaustVelocity' is supported.
     * @param  array<int, array{0: string, 1: float|int|null}>  $parameters
     */
    public function calc(string $desiredValue, array $parameters): ?float
    {
        $speedOfLight = constants('c');

        $params = collect($parameters)->pluck('1', '0');

        switch ($desiredValue) {
            case 'effectiveExhaustVelocity':
                return $this->calculateEffectiveExhaustVelocity(
                    $params->get('specificEnergy'),
                    $params->get('efficiency'),
                    $speedOfLight,
                );
            default:
                DebugLog('info', 'Invalid desired value.', ['desiredValue' => $desiredValue], 'equations');

                return null;
        }
    }

    private function calculateEffectiveExhaustVelocity($specificEnergy, $efficiency, $speedOfLight): ?float
    {
        if ($specificEnergy === null || $efficiency === null) {
            return null;
        }

        $usableEnergy = $efficiency * $specificEnergy;

        // Guard: no usable energy → no exhaust velocity.
        if ($usableEnergy <= 0.0) {
            return 0.0;
        }

        $lorentz = 1 + ($usableEnergy / ($speedOfLight * $speedOfLight));

        return $speedOfLight * sqrt(1 - (1 / ($lorentz * $lorentz)));
    }
}
