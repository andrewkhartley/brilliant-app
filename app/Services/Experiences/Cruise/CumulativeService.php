<?php

namespace App\Services\Experiences\Cruise;

class CumulativeService
{
    /**
     * Calculate and update cumulative data for the entire trip.
     *
     * @param  array  $tripData  Trip data array.
     * @return array Updated trip data array with cumulative values.
     */
    public function calc(array $tripData): array
    {
        foreach ($tripData['legData'] as $legDetails) {
            $this->update($tripData, $legDetails);
        }

        // Format cumulative data
        $tripData['tripDistanceFormatted'] = number_format($tripData['totalTripDis']);
        $tripData['tripDurationFormatted'] = secondsToDuration($tripData['totalTripDur']);
        $tripData['burnDistanceFormatted'] = number_format($tripData['totalBurnDis']);
        $tripData['burnDurationFormatted'] = secondsToDuration($tripData['totalBurnDur']);
        $tripData['cruiseDistanceFormatted'] = number_format($tripData['totalCruiseDis']);
        $tripData['cruiseDurationFormatted'] = secondsToDuration($tripData['totalCruiseDur']);
        $tripData['flipDistanceFormatted'] = number_format($tripData['totalFlipDis']);
        $tripData['flipDurationFormatted'] = secondsToDuration($tripData['totalFlipDur']);
        $tripData['orbitDistanceFormatted'] = number_format($tripData['totalOrbDis']);
        $tripData['orbitDurationFormatted'] = secondsToDuration($tripData['totalOrbDur']);
        $tripData['tripDilationFormatted'] = round($tripData['totalDilation'], 2);
        $tripData['tripDilationMinutes'] = round($tripData['totalDilation'] / 60, 2);

        return $tripData;
    }

    /**
     * Updates cumulative data with details from the current leg of the trip.
     *
     * @param  array  $tripData  Reference to the trip data array.
     * @param  array  $legDetails  Details of the current leg.
     */
    private function update(array &$tripData, array $legDetails): void
    {
        // Update Total Trip Distance and Duration
        $tripData['totalTripDis'] += $legDetails['finalLegDetails']['legDistance'];
        $tripData['totalTripDur'] += $legDetails['finalLegDetails']['legDuration'];

        // Update Total Burn Distance and Duration
        $tripData['totalBurnDis'] += $legDetails['finalLegDetails']['burnDistance'];
        $tripData['totalBurnDur'] += $legDetails['finalLegDetails']['burnDuration'];

        // Update Total Cruise Distance and Duration
        $tripData['totalCruiseDis'] += $legDetails['finalLegDetails']['cruiseDistance'];
        $tripData['totalCruiseDur'] += $legDetails['finalLegDetails']['cruiseDuration'];

        // Update Total Flip Distance and Duration
        $tripData['totalFlipDis'] += $legDetails['finalLegDetails']['flipDistance'];
        $tripData['totalFlipDur'] += $legDetails['finalLegDetails']['flipDuration'];

        // Update Total Orbit Distance and Duration
        $tripData['totalOrbDis'] += $legDetails['layoverDetails']['distance'];
        $tripData['totalOrbDur'] += $legDetails['layoverDetails']['duration'];

        // Update Total Dilation
        $tripData['totalDilation'] += $legDetails['finalLegDetails']['legDilation'];
    }
}
