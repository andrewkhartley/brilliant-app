<?php

namespace App\Equations\Physics;

use App\Equations\Physics\Concerns\ComputesInterstellarTripPhases;

/**
 * Interstellar Trip Duration (Dilated) — total proper (traveler) time
 * for a 3-phase relativistic trip, parallel in structure to
 * InterstellarTripDuration but composing the dilated time formulae
 * for each phase.
 *
 * Lifted from Andrew Hartley's 2024 Undaunted prototype:
 * undaunted-app-2024-08-14/public/assets/js/calculators/Interstellar-App.js
 * (header: "Created by Andrew K. Hartley"), inside calcTripDetails():
 *
 *   let accelerationDurationDilation =
 *       sol / tripAcceleration *
 *       Math.asinh(tripAcceleration * accelerationDuration / sol);
 *   cruiseDurationDilation =
 *       cruiseDistance / tripMaxSpeed *
 *       Math.sqrt(1 - ((tripMaxSpeed * tripMaxSpeed) / (sol * sol)));
 *
 *   tripDurationDilation = (tripStop === "stop")
 *       ? (2 * accelerationDurationDilation) + cruiseDurationDilation
 *       : accelerationDurationDilation + cruiseDurationDilation;
 *
 * The 3-phase decomposition (validate → unbounded accel → branch →
 * bounded accel / cruise) lives in the shared
 * ComputesInterstellarTripPhases trait; this class runs each phase
 * through the proper-time equations and sums them.
 */
class InterstellarTripDurationDilation
{
    use ComputesInterstellarTripPhases;

    /**
     * Returns the equation in MathJax format. As with TripDuration,
     * this is the compressed piecewise form; sibling equations
     * (InterstellarProperTimeAcceleration, InterstellarProperTimeCruise)
     * carry the full derivation.
     */
    public function equation(): string
    {
        return '\tau_{\text{total}} = k \cdot \tau_{\text{accel}} + \tau_{\text{cruise}}, \quad k \in \{1, 2\}';
    }

    /**
     * Returns the legend for the equation.
     *
     * @return array<string, string>
     */
    public function eqLegend(): array
    {
        return [
            '\tau_{\text{total}}' => 'Total proper (traveler) time for the trip',
            '\tau_{\text{accel}}' => 'Proper time during each acceleration phase',
            '\tau_{\text{cruise}}' => 'Proper time during the cruise phase (zero if no cruise)',
            'k' => 'Multiplier on the acceleration phase: 2 if the ship decelerates at the destination, 1 if it flies past',
        ];
    }

    /**
     * Calculate the total proper trip duration.
     *
     * @param  string  $desiredValue  Currently only 'tripDuration' is supported.
     * @param  array<int, array{0: string, 1: float|int|bool|null}>  $parameters
     */
    public function calc(string $desiredValue, array $parameters): ?float
    {
        $speedOfLight = constants('c');

        $params = collect($parameters)->pluck('1', '0');

        switch ($desiredValue) {
            case 'tripDuration':
                $acceleration = $params->get('acceleration');
                $maximumSpeed = $params->get('maximumSpeed');
                $stop = (bool) $params->get('stop');

                $phases = $this->computeInterstellarTripPhases(
                    $params->get('distance'),
                    $acceleration,
                    $maximumSpeed,
                    $stop,
                    $speedOfLight,
                );

                if ($phases === null) {
                    return null;
                }

                $accelerationProperTime = (new InterstellarProperTimeAcceleration)->calc('properTime', [
                    ['acceleration', $acceleration],
                    ['duration', $phases['accelerationDuration']],
                ]);

                $cruiseProperTime = $phases['isNoCruise']
                    ? 0.0
                    : (new InterstellarProperTimeCruise)->calc('properTime', [
                        ['distance', $phases['cruiseDistance']],
                        ['velocity', $maximumSpeed],
                    ]);

                return $stop
                    ? (2 * $accelerationProperTime) + $cruiseProperTime
                    : $accelerationProperTime + $cruiseProperTime;

            default:
                DebugLog('info', 'Invalid desired value.', ['desiredValue' => $desiredValue], 'equations');

                return null;
        }
    }
}
