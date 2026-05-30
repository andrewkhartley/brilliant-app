<?php

namespace App\Equations\Physics;

use App\Equations\Physics\Concerns\ComputesInterstellarTripPhases;

/**
 * Interstellar Trip Duration — total coordinate (Earth-frame) time for
 * a 3-phase relativistic trip (accelerate → cruise → optionally
 * decelerate), branching on whether the acceleration phase alone
 * already exceeds the available distance.
 *
 * Lifted from Andrew Hartley's 2024 Undaunted prototype:
 * undaunted-app-2024-08-14/public/assets/js/calculators/Interstellar-App.js
 * (header: "Created by Andrew K. Hartley"), inside calcTripDetails():
 *
 *   // No-cruise branch
 *   if ((tripStop === "stop" && accelerationDistance > tripDistance / 2) ||
 *       (tripStop !== "stop" && accelerationDistance > tripDistance)) {
 *       accelerationDistance = (tripStop === "stop") ? tripDistance / 2 : tripDistance;
 *       accelerationDuration = Math.sqrt(
 *           (Math.pow(accelerationDistance, 2) / Math.pow(sol, 2)) +
 *           (2 * accelerationDistance / tripAcceleration)
 *       );
 *       cruiseDuration = 0;
 *   } else if (tripStop === "stop") {
 *       cruiseDuration = (tripDistance - 2 * accelerationDistance) / tripMaxSpeed;
 *   } else {
 *       cruiseDuration = (tripDistance - accelerationDistance) / tripMaxSpeed;
 *   }
 *
 *   tripDuration = (tripStop === "stop")
 *       ? (2 * accelerationDuration) + cruiseDuration
 *       : accelerationDuration + cruiseDuration;
 *
 * The 3-phase decomposition (validate → unbounded accel → branch →
 * bounded accel / cruise) lives in the shared
 * ComputesInterstellarTripPhases trait; this class composes the final
 * coordinate-time sum from the per-phase numbers.
 */
class InterstellarTripDuration
{
    use ComputesInterstellarTripPhases;

    /**
     * Returns the equation in MathJax format. The piecewise form is
     * intentionally compressed; the legend + sibling equations supply
     * the full derivation.
     */
    public function equation(): string
    {
        return 't_{\text{total}} = k \cdot t_{\text{accel}} + t_{\text{cruise}}, \quad k \in \{1, 2\}';
    }

    /**
     * Returns the legend for the equation.
     *
     * @return array<string, string>
     */
    public function eqLegend(): array
    {
        return [
            't_{\text{total}}' => 'Total coordinate (Earth-frame) trip time',
            't_{\text{accel}}' => 'Coordinate duration of each acceleration phase',
            't_{\text{cruise}}' => 'Coordinate duration of the constant-velocity cruise phase (zero if no cruise)',
            'k' => 'Multiplier on the acceleration phase: 2 if the ship decelerates at the destination, 1 if it flies past',
        ];
    }

    /**
     * Calculate the total coordinate trip duration.
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
                $stop = (bool) $params->get('stop');

                $phases = $this->computeInterstellarTripPhases(
                    $params->get('distance'),
                    $params->get('acceleration'),
                    $params->get('maximumSpeed'),
                    $stop,
                    $speedOfLight,
                );

                if ($phases === null) {
                    return null;
                }

                return $stop
                    ? (2 * $phases['accelerationDuration']) + $phases['cruiseDuration']
                    : $phases['accelerationDuration'] + $phases['cruiseDuration'];

            default:
                DebugLog('info', 'Invalid desired value.', ['desiredValue' => $desiredValue], 'equations');

                return null;
        }
    }
}
