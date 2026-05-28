<?php

namespace App\Services\Experiences\Cruise;

use App\Equations\Geometry\CoordinateDistance;

class CalculatorService
{
    protected CoordinateDistance $coordinateDistance;

    public function __construct(CoordinateDistance $coordinateDistance)
    {
        $this->coordinateDistance = $coordinateDistance;
    }

    /**
     * Calculates the coordinates and time difference for a given location based on provided data and the start time of a leg.
     *
     * @param  array  $loc  The code of the location (e.g., 'sun', 'obs', or planetary codes).
     * @param  array|null  $locData  The data array containing location information including timestamps and coordinates.
     * @param  int  $legStart  The start time of the leg as a Unix timestamp.
     * @return array An associative array containing the coordinates (x, y, z) and time difference (timeDiff) in seconds between the leg start and the closest timestamp in the data.
     *               If the location is the sun or observation point, returns fixed coordinates.
     *               If no close match is found, returns null for all values.
     */
    public function coordBuild(array $loc, ?array $locData, int $legStart): array
    {

        if ($loc['code'] == 'obs') {
            return ['x' => 0, 'y' => 0, 'z' => 4487936121, 'timeDiff' => 0];
        } else {
            $closestDiff = PHP_INT_MAX;
            $closestCoordinates = ['x' => null, 'y' => null, 'z' => null, 'timeDiff' => null];

            foreach ($locData['data'] as $entry) {
                $entryTimestamp = strtotime($entry['timestamp']);
                $diff = $legStart - $entryTimestamp;

                if (abs($diff) < $closestDiff) {
                    $closestDiff = abs($diff);
                    $closestCoordinates = [
                        'x' => $entry['x'],
                        'y' => $entry['y'],
                        'z' => $entry['z'],
                        'timeDiff' => $diff,
                    ];
                }
            }

            // No Match Found
            return $closestCoordinates['x'] === null ? ['x' => null, 'y' => null, 'z' => null, 'timeDiff' => null] : $closestCoordinates;
        }
    }

    /**
     * Calculates duration, distance, and time dilation for a given distance and speed.
     * This function uses the theory of relativity to account for time dilation at high speeds.
     *
     * @param  float  $legDistance  The total distance of the leg in kilometers.
     * @param  float  $speed  The cruising speed, in units consistent with the distance parameter.
     * @param  float  $accelerationDistance  The distance covered during acceleration and deceleration.
     * @return array An associative array containing 'cruiseDistance', 'cruiseDuration', 'cruiseDurationDilation', and 'cruiseDilation'.
     *               Each element represents the respective calculated value for the given trip and speed.
     */
    public function disDurDil(float $legDistance, float $speed, float $accelerationDistance): array
    {

        // Calculate
        $sol = constants('c');
        $distance = $legDistance * 1000 - ($accelerationDistance * 2);
        $duration = $distance / $speed;
        $durationDilation = $duration * sqrt(1 - (pow($speed, 2) / pow($sol, 2)));
        $dilation = $duration - $durationDilation;

        return [
            'distance' => $distance,
            'duration' => $duration,
            'durationDilation' => $durationDilation,
            'dilation' => $dilation,
        ];
    }

    /**
     * Calculates the actual and full distances of a leg, including no-burn distances.
     *
     * @param  array  $depCoordinates  Coordinates for the departure location.
     * @param  array  $arrCoordinates  Coordinates for the arrival location.
     * @param  array  $depNoBurn  No-burn details for the departure location.
     * @param  array  $arrNoBurn  No-burn details for the arrival location.
     * @return array Array containing actual and full distances of the leg.
     */
    public function legDistance(array $depCoordinates, array $arrCoordinates, array $depNoBurn, array $arrNoBurn): array
    {

        // Calculate Distances
        $actualDistance = $this->coordinateDistance->calc($depCoordinates, $arrCoordinates);
        $fullDistance = $actualDistance + $depNoBurn['distance'] + $arrNoBurn['distance'];

        return [
            'actual' => $actualDistance,
            'full' => $fullDistance,
        ];
    }

    /**
     * Calculates orbital adjustments for a given destination based on its orbital details, specified trajectory, and time adjustments.
     * This method uses the destination's orbital period and coefficients to adjust the x, y, and z coordinates dynamically based on the provided time and trajectory.
     *
     * @param  array  $destinationDetails  Details of the destination including orbital parameters such as coefficients for x, y, z, and orbital period.
     * @param  float  $trajectory  The current trajectory or angle of travel, used for initial orbital calculations.
     * @param  int  $timeOffset  Optional. The time offset in seconds to adjust for specific times in the orbital cycle.
     * @return array An array containing adjusted x, y, and z coordinates.
     */
    public function orbitalAdjustments(array $destinationDetails, float $trajectory, int $timeOffset = 0): array
    {
        $adjustments = ['x' => 0, 'y' => 0, 'z' => 0];

        if ($destinationDetails['isOrbital']) {
            // Adjust trajectory to include time-based phase shift if necessary
            $phaseShift = ($timeOffset / $destinationDetails['orbitalPeriod']) * 2 * pi();
            $baseFormula = 2 * pi() * ($trajectory / 360) + $phaseShift;

            $adjustments['x'] = $destinationDetails['xDepCoeff'] * cos($baseFormula - 0.5 * pi());
            $adjustments['y'] = $destinationDetails['yDepCoeff'] * cos($baseFormula + pi());
            $adjustments['z'] = $destinationDetails['zDepCoeff'] * cos($baseFormula);
        }

        return $adjustments;
    }

    /**
     * Calculates the trajectory based on coordinate differences and optional orbital adjustment.
     *
     * @param  float  $delX  The difference in the X coordinates.
     * @param  float  $delY  The difference in the Y coordinates.
     * @param  bool  $orbAdj  Indicates whether an orbital adjustment is needed.
     * @return float The calculated trajectory angle.
     */
    public function trajectory(float $delX, float $delY, bool $orbAdj): float
    {
        $trajectory = 0;
        if ($delX == 0 && $delY == 0) {
            return $trajectory;
        }

        if ($delX == 0) {
            $trajectory = $delY > 0 ? 90 : 270;
        } elseif ($delY == 0) {
            $trajectory = $delX > 0 ? 0 : 180;
        } else {
            $angle = rad2deg(atan2($delY, $delX));
            $trajectory = $angle < 0 ? $angle + 360 : $angle;
        }

        if ($orbAdj) {
            $trajectory = ($trajectory + 90) % 360;
        }

        return $trajectory;
    }
}
