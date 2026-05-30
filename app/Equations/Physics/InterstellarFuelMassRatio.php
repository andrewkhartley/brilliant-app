<?php

namespace App\Equations\Physics;

/**
 * Interstellar Fuel Mass Ratio — the Tsiolkovsky relativistic rocket
 * equation: initial-to-final mass ratio m_i/m_f required to achieve
 * a velocity change Δv with effective exhaust velocity v_e.
 *
 * NEW derivation for Brilliant Phase 8 — this equation is NOT in
 * Andrew Hartley's 2024 Undaunted prototype. It is the relativistic
 * generalization of the classical Tsiolkovsky rocket equation
 * (Δv = v_e · ln(m_i/m_f)) and is needed for the fuel-budget
 * visualization on the Interstellar habitat page.
 *
 * Formula:
 *
 *     m_i / m_f = ( (1 + Δv/c) / (1 − Δv/c) )^( c / (2·v_e) )
 *
 * This reduces to the classical Tsiolkovsky form when Δv ≪ c.
 *
 * Δv conventions used by Brilliant's habitat UI:
 *   • One-way with stop: Δv = 2·v_max (accelerate to v_max, then
 *     decelerate to 0 at the destination — each leg consumes a Δv
 *     of v_max).
 *   • One-way fly-by:    Δv = v_max  (no deceleration).
 *
 * Reality check:
 *   The exponent c / (2·v_e) is what makes interstellar travel so
 *   brutal under sub-c exhaust. For fission-grade v_e (≲ 10⁷ m/s)
 *   the exponent is ~15; even modest Δv values translate to
 *   astronomical mass ratios. Antimatter (v_e ≈ 0.866c) brings the
 *   exponent down near 0.58, which is what makes it the only
 *   chemistry-or-physics-based fuel that makes sense for crewed
 *   interstellar Δv budgets.
 *
 * Guards:
 *   • Δv ≥ c returns INF (asymptotic; would require infinite fuel).
 *   • v_e ≤ 0 returns INF (no thrust → no motion possible).
 */
class InterstellarFuelMassRatio
{
    /**
     * Returns the equation in MathJax format.
     */
    public function equation(): string
    {
        return '\frac{m_{i}}{m_{f}} = \left( \frac{1 + \Delta v / c}{1 - \Delta v / c} \right)^{\frac{c}{2 v_{e}}}';
    }

    /**
     * Returns the legend for the equation.
     *
     * @return array<string, string>
     */
    public function eqLegend(): array
    {
        return [
            'm_{i}' => 'Initial vessel mass (vessel + fuel)',
            'm_{f}' => 'Final vessel mass (dry vessel after burn)',
            '\Delta v' => 'Total velocity change required for the trip',
            'c' => 'Speed of light',
            'v_{e}' => 'Effective exhaust velocity',
        ];
    }

    /**
     * Calculate the mass ratio.
     *
     * @param  string  $desiredValue  Currently only 'massRatio' is supported.
     * @param  array<int, array{0: string, 1: float|int|null}>  $parameters
     */
    public function calc(string $desiredValue, array $parameters): ?float
    {
        $speedOfLight = constants('c');

        $params = collect($parameters)->pluck('1', '0');

        switch ($desiredValue) {
            case 'massRatio':
                return $this->calculateMassRatio(
                    $params->get('deltaV'),
                    $params->get('effectiveExhaustVelocity'),
                    $speedOfLight,
                );
            default:
                DebugLog('info', 'Invalid desired value.', ['desiredValue' => $desiredValue], 'equations');

                return null;
        }
    }

    private function calculateMassRatio($deltaV, $effectiveExhaustVelocity, $speedOfLight): ?float
    {
        if ($deltaV === null || $effectiveExhaustVelocity === null) {
            return null;
        }

        if ($deltaV >= $speedOfLight) {
            return INF;
        }

        if ($effectiveExhaustVelocity <= 0.0) {
            return INF;
        }

        $base = (1 + ($deltaV / $speedOfLight)) / (1 - ($deltaV / $speedOfLight));
        $exponent = $speedOfLight / (2 * $effectiveExhaustVelocity);

        return pow($base, $exponent);
    }
}
