import { SPEED_OF_LIGHT } from '../constants';
import type { Equation } from './types';

/**
 * Tsiolkovsky relativistic rocket equation — initial-to-final mass
 * ratio required to achieve a velocity change Δv with effective
 * exhaust velocity v_e:
 *
 *   m_i / m_f = ( (1 + Δv/c) / (1 − Δv/c) )^( c / (2 · v_e) )
 *
 * Reduces to the classical Tsiolkovsky form (`Δv = v_e · ln(m_i/m_f)`)
 * when Δv ≪ c. The exponent `c / (2·v_e)` is what makes interstellar
 * travel brutal under sub-c exhaust: for fission-grade v_e (~10⁷ m/s)
 * the exponent is ~15, so modest Δv values balloon to astronomical
 * mass ratios. Antimatter (v_e ≈ 0.866c) brings the exponent near
 * 0.58 — the only physics-based fuel that survives a crewed
 * interstellar Δv budget.
 *
 * Δv conventions used by Brilliant's habitat UI:
 *   • One-way with stop: Δv = 2 · v_max (each leg costs v_max)
 *   • One-way fly-by:    Δv =     v_max (no deceleration)
 *
 * Guards:
 *   • `Δv ≥ c`  → `Infinity` (asymptotic; infinite fuel)
 *   • `v_e ≤ 0` → `Infinity` (no thrust → no motion possible)
 *
 * PHP twin: App\Equations\Physics\InterstellarFuelMassRatio::calc
 * (parameter keys: `deltaV`, `effectiveExhaustVelocity`). NEW
 * derivation — NOT in the 2024 Undaunted prototype; first appears in
 * the Brilliant Phase 8 fuel-budget visualisation. The parity fixture
 * at tests/fixtures/equations-parity.json verifies this TS port
 * matches the PHP twin, including the `Δv ≥ c → Infinity` case
 * (serialised as the string sentinel `"Infinity"` in JSON; the parity
 * test deserialises it back to `Number.POSITIVE_INFINITY`).
 */
export const interstellarFuelMassRatio: Equation = {
    id: 'interstellar-fuel-mass-ratio',
    name: 'Relativistic fuel mass ratio',
    latex: '\\frac{m_{i}}{m_{f}} = \\left( \\frac{1 + \\Delta v / c}{1 - \\Delta v / c} \\right)^{\\frac{c}{2 v_{e}}}',
    variables: [
        {
            symbol: 'massRatio',
            label: 'Initial-to-final mass ratio',
            units: 'dimensionless',
        },
        {
            symbol: 'deltaV',
            label: 'Total velocity change',
            units: 'm/s',
        },
        {
            symbol: 'effectiveExhaustVelocity',
            label: 'Effective exhaust velocity',
            units: 'm/s',
        },
    ],
    compute: ({ deltaV, effectiveExhaustVelocity }) => {
        if (deltaV >= SPEED_OF_LIGHT) {
            return Infinity;
        }

        if (effectiveExhaustVelocity <= 0) {
            return Infinity;
        }

        const beta = deltaV / SPEED_OF_LIGHT;
        const base = (1 + beta) / (1 - beta);
        const exponent = SPEED_OF_LIGHT / (2 * effectiveExhaustVelocity);

        return Math.pow(base, exponent);
    },
};
