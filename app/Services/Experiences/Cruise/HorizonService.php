<?php

namespace App\Services\Experiences\Cruise;

use App\Models\Experiences\Cruise\Destination;
use App\Services\API\HorizonService as APIHorizonService;
use App\Services\Sessions\SessionManager;
use GuzzleHttp\Exception\GuzzleException;

class HorizonService
{
    protected APIHorizonService $apiHorizonService;

    private ConfigService $config;

    private SessionManager $session;

    public function __construct(
        APIHorizonService $apiHorizonService,
        ConfigService $config,
        SessionManager $session
    ) {
        $this->apiHorizonService = $apiHorizonService;
        $this->config = $config;
        $this->session = $session;
    }

    /**
     * Adds horizon data to each destination in the provided data array.
     *
     * @param  array  $destinationsData  Data array containing destination details.
     * @param  int  $legStart  The start time of the leg.
     * @return array Updated destinations data with horizon data included.
     *
     * @throws GuzzleException
     */
    public function addHorizonData(array $destinationsData, int $legStart): array
    {
        // Cache::forget('solarSystemFacts.all');
        $cachedFacts = Destination::getCachedFacts();
        $queriedDestinations = [];

        foreach ($destinationsData as &$destination) {
            $fact = $cachedFacts->firstWhere('destination_code', $destination['destination']);
            if ($fact && $fact->horizons && ! in_array($destination['destination'], $queriedDestinations)) {
                $destination['horizonId'] = $fact->horizons_id;
                $horizonData = $this->apiHorizonService->horizonQuery($fact->horizons_id, $legStart, 1440 * $this->config->periodStep(), $this->config->periodDuration());
                $sessionKey = $destination['destination'].'PeriodData';
                $this->session->set($sessionKey, $horizonData);

                // Add the Destination to the Queried List
                $queriedDestinations[] = $destination['destination'];
            }
        }

        return $destinationsData;
    }

    /**
     * Forgets a list of predefined session keys.
     */
    public function forgetHorizonSessions(): void
    {
        $possibleHorizonSessions = [
            'earStartData', 'earEndData', 'earPeriodData',
            'sunData', 'sunPeriodData',
            'merData', 'merPeriodData',
            'venData', 'venPeriodData',
            'marData', 'marPeriodData',
            'jupData', 'jupPeriodData',
            'satData', 'satPeriodData',
            'uraData', 'uraPeriodData',
            'nepData', 'nepPeriodData',
            'pluData', 'pluPeriodData',
        ];

        foreach ($possibleHorizonSessions as $sessionKey) {
            $this->session->forget($sessionKey);
        }
    }
}
