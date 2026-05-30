import { SPEED_OF_LIGHT } from '../constants';
import type { Equation } from './types';

/**
 * Effective exhaust velocity for a relativistic rocket:
 *   v_e = c · √(1 − 1/γ²),    γ = 1 + (η · E_s) / c²
 *
 * Relativistic-aware effective exhaust velocity given the fuel's
 * specific energy `E_s` (J/kg) and conversion efficiency `η` (0–1).
 * Derivation: the relativistic kinetic energy per unit mass of
 * exhaust is (γ − 1)·c², set equal to `η · E_s` and solved for γ,
 * then for v_e via the standard `v = c·√(1 − 1/γ²)` relation.
 *
 * Why relativistic and not classical: the Newtonian `v_e = √(2·η·E_s)`
 * silently exceeds c near antimatter energy densities (E_s ≈ c²
 * at η = 1). The relativistic form caps v_e at c · √(3/4) ≈ 0.866c
 * for the photon-rocket-but-not-quite limit of η·E_s = c².
 *
 * PHP twin: App\Equations\Physics\InterstellarEffectiveExhaustVelocity::calc
 * (parameter keys: `specificEnergy`, `efficiency`). NEW derivation —
 * NOT in the 2024 Undaunted prototype; first appears in the Brilliant
 * Phase 8 fuel-budget visualisation. The parity fixture at
 * tests/fixtures/equations-parity.json verifies this TS port matches
 * the PHP twin to within numeric tolerance for the cases the artisan
 * equations:dump command generates.
 */
export const interstellarEffectiveExhaustVelocity: Equation = {
    id: 'interstellar-effective-exhaust-velocity',
    name: 'Effective exhaust velocity',
    latex: 'v_{e} = c \\cdot \\sqrt{1 - \\frac{1}{\\gamma^{2}}}, \\quad \\gamma = 1 + \\frac{\\eta \\cdot E_{s}}{c^{2}}',
    variables: [
        {
            symbol: 'vE',
            label: 'Effective exhaust velocity',
            units: 'm/s',
        },
        {
            symbol: 'specificEnergy',
            label: 'Specific energy of the fuel',
            units: 'J/kg',
        },
        {
            symbol: 'efficiency',
            label: 'Energy-conversion efficiency',
            units: 'dimensionless',
        },
    ],
    compute: ({ specificEnergy, efficiency }) => {
        const usableEnergy = efficiency * specificEnergy;

        // Guard: no usable energy → no exhaust velocity.
        if (usableEnergy <= 0) {
            return 0;
        }

        const lorentz = 1 + usableEnergy / (SPEED_OF_LIGHT * SPEED_OF_LIGHT);

        return SPEED_OF_LIGHT * Math.sqrt(1 - 1 / (lorentz * lorentz));
    },
};
