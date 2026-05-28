/**
 * Type definitions for the equation registry.
 *
 * Each equation in `resources/js/lib/equations/*.ts` exports a const that
 * satisfies the `Equation` interface. The registry index (`./index.ts`)
 * collects all equations into a single typed array for consumers.
 *
 * Convention: `variables[]` lists the LHS (output) variable first, then
 * the RHS (input) variables in LaTeX order. `compute(vars)` accepts a
 * record keyed by RHS variable symbols and returns the LHS value.
 */

export interface EquationVariable {
    /** LaTeX symbol used in the equation (case-sensitive, e.g. 'v', 'M', 'T'). */
    symbol: string;
    /** Human-readable name shown in UI labels. */
    label: string;
    /** Optional SI unit string (e.g. 'm/s', 'kg', 'seconds'). */
    units?: string;
    /** Optional sensible default for sliders. */
    default?: number;
    /** Optional slider minimum. */
    min?: number;
    /** Optional slider maximum. */
    max?: number;
    /** Optional slider step. */
    step?: number;
    /** Optional one-line description for tooltips. */
    description?: string;
}

export interface Equation {
    /** Unique kebab-case id (e.g. 'relativistic-speed'). Used as React keys. */
    id: string;
    /** Display name. */
    name: string;
    /** Full LaTeX source, ready to feed to KaTeX. */
    latex: string;
    /**
     * All variables in the equation. First entry is the LHS (output);
     * the rest are RHS (inputs).
     */
    variables: EquationVariable[];
    /**
     * Optional IDs of other registry equations this one is composed from.
     * Declarative metadata in v1 (not evaluated at compute time); surfaces
     * the OmniCalculator-style decomposition narrative on the Habitat page.
     */
    composedFrom?: string[];
    /**
     * Forward-only computation: given RHS input values keyed by symbol,
     * return the LHS value. Inputs not listed in `variables[1..]` are
     * ignored. Inputs whose values are missing cause undefined behavior
     * by design (no defensive guards in v1; caller's responsibility).
     */
    compute(vars: Record<string, number>): number;
}
