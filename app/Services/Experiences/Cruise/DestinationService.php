<?php

namespace App\Services\Experiences\Cruise;

use App\Equations\Physics\OrbitalPeriod;
use App\Equations\Physics\OrbitalVelocity;
use App\Models\Experiences\Cruise\Destination;
use GuzzleHttp\Exception\GuzzleException;

class DestinationService
{
    public const string DATA_SOURCE_HORIZONS = 'horizons';

    public const string DATA_SOURCE_EPHEMERIS = 'ephemeris';

    private ApproximateEphemerisService $approximateEphemerisService;

    private HorizonService $horizonService;

    private OrbitalVelocity $orbitalVelocity;

    private OrbitalPeriod $orbitalPeriod;

    public function __construct(
        ApproximateEphemerisService $approximateEphemerisService,
        HorizonService $horizonService,
        OrbitalVelocity $orbitalVelocity,
        OrbitalPeriod $orbitalPeriod
    ) {
        $this->approximateEphemerisService = $approximateEphemerisService;
        $this->horizonService = $horizonService;
        $this->orbitalVelocity = $orbitalVelocity;
        $this->orbitalPeriod = $orbitalPeriod;
    }

    /**
     * @throws GuzzleException
     */
    public function prepareDestinationsData(
        array $destinationsData,
        $tripStart,
        string $dataSource = self::DATA_SOURCE_HORIZONS,
    ): array
    {
        $destinationsData = $this->prependAndAppendEarth($destinationsData);

        if ($dataSource === self::DATA_SOURCE_EPHEMERIS) {
            return $this->approximateEphemerisService->addEphemerisData(
                $destinationsData,
                $tripStart,
                1440,
                31536000,
            );
        }

        return $this->horizonService->addHorizonData($destinationsData, $tripStart);
    }

    /**
     * Retrieves details of a destination for trip planning purposes using cached data.
     *
     * @param  string  $destinationCode  The code of the destination (e.g., 'ear', 'obs').
     * @return array Details of the destination including orbital information and specific adjustments.
     */
    public function getDetails(string $destinationCode): array
    {
        // Fetch from Cache
        $allDestinations = Destination::getCachedFacts();
        $destination = $allDestinations->firstWhere('destination_code', $destinationCode);

        if ($destination === null) {
            $details = EphemerisCatalog::details($destinationCode);

            if ($details === null) {
                $details = [
                    'code' => $destinationCode,
                    'name' => 'Unknown',
                    'horizonsId' => 0,
                    'mass' => 0,
                    'radius' => 0,
                    'orbitalPeriod' => 0,
                    'orbitalAltitude' => 0,
                    'tilt' => 0,
                    'offset' => 0,
                    'isOrbital' => false,
                    'x' => 0,
                    'y' => 0,
                    'z' => 0,
                ];
            }

            return $this->completeOrbitalDetails($details);
        }

        // Initiate Values
        $details = [
            'code' => $destinationCode,
            'name' => $destination->destination ?? 'Unknown',
            'horizonsId' => $destination->horizons_id ?? 0,
            'mass' => $destination->mass ?? null,
            'radius' => $destination->radius ?? null,
            'orbitalPeriod' => $destination->orbital_period ?? null,
            'orbitalAltitude' => $destination->orbital_altitude ?? null,
            'tilt' => $destination->tilt ?? 0,
            'offset' => $destination->offset ?? 0,
            'isOrbital' => $destination->orbital == 1,
            'x' => $destination->x_coord,
            'y' => $destination->y_coord,
            'z' => $destination->z_coord,
        ];

        return $this->completeOrbitalDetails($details);
    }

    private function completeOrbitalDetails(array $details): array
    {
        // Orbital Radius
        $orbitalRadius = ($details['radius'] + $details['orbitalAltitude']) * 1000;

        // Earth Tilt (Space Elevator Dock)
        if ($details['code'] === 'ear') {
            $details['orbitalVelocity'] = (2 * pi() * $orbitalRadius) / $details['orbitalPeriod'];
        }

        // Orbital Calculations
        if ($details['isOrbital'] && $details['orbitalPeriod'] == 0) {

            // Orbital Velocity
            $details['orbitalVelocity'] = $this->orbitalVelocity->calc('velocity', [
                ['mass', $details['mass']], ['radius', $orbitalRadius]]);

            // Orbital Period
            $details['orbitalPeriod'] = $this->orbitalPeriod->calc('period', [
                ['radius', $orbitalRadius], ['velocity', $details['orbitalVelocity']]]);

        } elseif (! $details['isOrbital']) {
            $details['orbitalVelocity'] = 0;
        }

        // Calculate Coefficients for Orbital Path Coordinates
        $details['xDepCoeff'] = $orbitalRadius / 1000;
        $details['yDepCoeff'] = $orbitalRadius * cos(deg2rad($details['tilt'])) / 1000;
        $details['zDepCoeff'] = $orbitalRadius * cos(deg2rad($details['tilt'] - 90)) / 1000;

        // Round Z Coefficient for Non-Tilt
        if ($details['zDepCoeff'] < 0.01 && $details['zDepCoeff'] > -0.01) {
            $details['zDepCoeff'] = 0;
        }

        return $details;
    }

    /**
     * Prepend and append Earth to the list of destinations.
     *
     * @param  array  $destinationsData  An array of destination data before modification.
     * @return array The modified array with Earth added at the beginning and the end.
     */
    public function prependAndAppendEarth(array $destinationsData): array
    {
        array_unshift($destinationsData, $this->earthDestination());
        $destinationsData[] = $this->earthDestination();

        return $destinationsData;
    }

    /**
     * Provides the default Earth destination data.
     *
     * @return array The associative array representing Earth as a destination.
     */
    private function earthDestination(): array
    {
        return ['destination' => 'ear', 'name' => 'Earth', 'horizonId' => 399];
    }
}
