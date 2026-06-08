<?php

// ChatGPT Efficiency Review
// https://chat.openai.com/c/50e05c7b-878b-41eb-9ffe-19869c2845b4

namespace App\Services\Experiences\Cruise;

use App\Equations\Physics\AccelerationDuration;
use App\Equations\Physics\OrbitalPeriod;
use App\Equations\Physics\OrbitalVelocity;
use App\Equations\Physics\RelativisticSpeed;
use App\Services\API\HorizonService;
use App\Services\Sessions\SessionManager;
use GuzzleHttp\Exception\GuzzleException;

class TripBuilderService
{
    // App Services
    private ConfigService $config;

    private ApproximateEphemerisService $approximateEphemerisService;

    private CumulativeService $cumulativeService;

    private DestinationService $destinationService;

    private HorizonService $horizonService;

    private SessionManager $session;

    // Formulas
    protected AccelerationDuration $accelDuration;

    private CalculatorService $calculator;

    protected OrbitalPeriod $orbitalPeriod;

    protected OrbitalVelocity $orbitalVelocity;

    protected RelativisticSpeed $relativisticSpeed;

    /**
     * Service Constructor
     */
    public function __construct(
        ConfigService $config,
        ApproximateEphemerisService $approximateEphemerisService,
        CumulativeService $cumulativeService,
        DestinationService $destinationService,
        HorizonService $horizonService,
        SessionManager $session,

        AccelerationDuration $accelDuration,
        CalculatorService $calculator,
        OrbitalPeriod $orbitalPeriod,
        OrbitalVelocity $orbitalVelocity,
        RelativisticSpeed $relativisticSpeed
    ) {
        $this->config = $config;
        $this->approximateEphemerisService = $approximateEphemerisService;
        $this->cumulativeService = $cumulativeService;
        $this->destinationService = $destinationService;
        $this->horizonService = $horizonService;
        $this->session = $session;

        $this->accelDuration = $accelDuration;
        $this->calculator = $calculator;
        $this->orbitalPeriod = $orbitalPeriod;
        $this->orbitalVelocity = $orbitalVelocity;
        $this->relativisticSpeed = $relativisticSpeed;
    }

    /**
     * Initializes and returns essential settings for a trip based on input data.
     * This includes the start time of the trip, flip duration, and cruise ratio.
     *
     * @param  array  $tripData  The input data for the trip, including date and optional settings.
     * @return array An array containing the start time, flip duration, and cruise ratio.
     */
    private function tripSettings(array $tripData): array
    {
        $tripStart = strtotime($tripData['tripDate']);

        return [
            'start' => $tripStart,
            'flip' => $tripData['flipDur'] ?? 300,
            'ratio' => isset($tripData['percent']) ? $tripData['percent'] / 100 : 0.35,
            'dataSource' => $tripData['dataSource'] ?? DestinationService::DATA_SOURCE_HORIZONS,
        ];
    }

    /**
     * Builds the trip including legs and initializes trip data.
     *
     * @param  array  $tripData  The start date of the trip.
     * @param  array  $destinationsData  Data of the destinations.
     * @return array Trip data including legs and other information.
     *
     * @throws GuzzleException
     */
    public function tripBuild(array $tripData, array $destinationsData): array
    {

        // Process Main Trip Data
        $tripSettings = $this->tripSettings($tripData);
        $tripStart = $tripSettings['start'];

        // Build Legs
        $tripLegs = $this->buildLegs($destinationsData);

        // Initialize Trip Data
        $tripData = [
            'legData' => [],
            'nextDep' => $tripStart,
            'legStart' => '',
            'initTraj' => 0,
            'priorOrbitDur' => 0,
            'priorDist' => 0,
            'totalTripDis' => 0,
            'totalTripDur' => 0,
            'totalBurnDis' => 0,
            'totalBurnDur' => 0,
            'totalCruiseDur' => 0,
            'totalCruiseDis' => 0,
            'totalFlipDis' => 0,
            'totalFlipDur' => 0,
            'totalOrbDis' => 0,
            'totalOrbDur' => 0,
            'totalDilation' => 0,
            'cruiseStatus' => 0,
            'legs' => $tripLegs,
        ];

        // Earth Start Data
        $earStartData = $this->positionQuery('ear', 399, $tripStart, 60, 86400, $tripSettings['dataSource']);
        $this->session->set('earStartData', $earStartData);

        foreach ($tripData['legs'] as $leg => $route) {

            // Set Leg Number (Array Offset)
            $legNumber = $leg + 1;

            // Run Leg Segment
            $legDetails = $this->legSegment($legNumber, $tripData, $tripSettings);

            // First Departure and Final Arrival
            if (! isset($tripData['departureTime'])) {
                $tripData['departureTime'] = $legDetails['departureTime'];
            }
            $tripData['arrivalTime'] = $legDetails['arrivalTime'];
            $tripData['finalDuration'] = secondsToDuration(strtotime($tripData['arrivalTime']) - strtotime($tripData['departureTime']));

            // Update leg data
            $tripData['legData'][$legNumber] = $legDetails;

            // Update next departure, initial trajectory and cumulative values
            $tripData['nextDep'] = $legDetails['nextDep'];
            $tripData['total'] = $this->cumulativeService->calc($tripData);

        }

        return $tripData;
    }

    /**
     * Calculates the details of a single leg of the trip.
     *
     * @param  int  $legNumber  The number of the leg in the trip.
     * @param  array  $tripData  Data of the trip.
     * @param  array  $tripSettings  Settings of the trip.
     * @return array Calculated details for the leg.
     *
     * @throws GuzzleException
     */
    private function legSegment(int $legNumber, array $tripData, array $tripSettings): array
    {

        // Set Leg Segment (Array Starts at 0)
        $legSegment = $tripData['legs'][$legNumber - 1];

        // Set Leg Abbreviations
        $departure = $legSegment['dep']['destination'];
        $arrival = $legSegment['arr']['destination'];

        // Next Leg Segment
        $arrNextData = [];
        if (isset($tripData['legs'][$legNumber])) {
            $legNextSegment = $tripData['legs'][$legNumber];
            $arrNextDestination = $legNextSegment['arr']['destination'];
            $arrNextDetails = $this->destinationService->getDetails($arrNextDestination);
            $sessionKey = $arrNextDestination.'PeriodData';
            $arrNextData = $this->session->get($sessionKey);
        }

        // Set Data Sources
        $depData = $departure === 'ear' ? $this->session->get('earStartData') : $this->session->get($departure.'Data');
        $arrPeriodData = $this->session->get($arrival.'PeriodData');

        // Get Departure/Arrival Details
        $depDetails = $this->destinationService->getDetails($departure);
        $arrDetails = $this->destinationService->getDetails($arrival);

        // Calculate Initial Coordinates
        $initDepCoordinates = $this->calculator->coordBuild($depDetails, $depData, $tripData['nextDep']);
        $initArrCoordinates = $this->calculator->coordBuild($arrDetails, $arrPeriodData, $tripData['nextDep']);   // Using Period, Will Retrieve Precise Coordinates Later

        // Determine Leg Trajectory
        $delX = $initArrCoordinates['x'] - $initDepCoordinates['x'];
        $delY = $initArrCoordinates['y'] - $initDepCoordinates['y'];
        $legTrajectory = $this->calculator->trajectory($delX, $delY, false);

        // Departure Coordinate Adjustment
        $timeStart = $tripData['nextDep'];
        $depAdj = [
            'x' => 0,
            'y' => 0,
            'z' => 0,
        ];
        if ($depDetails['isOrbital']) {
            $timeStart = $this->earthDepartureOffset($departure, $tripData['nextDep'], $depDetails);
            $phaseShift = ($timeStart - $depDetails['offset']);
            $trajectory = ($phaseShift / $depDetails['orbitalPeriod']) * 360 + 0.25 * 360 + $tripData['initTraj'] * 360;
            $depAdj = $this->calculator->orbitalAdjustments($depDetails, $trajectory, $phaseShift);
        }

        // Set Orbital Trajectory
        $orbTrajectory = $tripData['initTraj'] > 0
            ? $tripData['initTraj']
            : $this->calculator->trajectory($depAdj['x'], $depAdj['y'], true);

        // Arrival Coordinate Adjustment
        $arrAdj = $this->calculator->orbitalAdjustments($arrDetails, $legTrajectory);

        // Departure Offset for Orbital
        $depOffset = $depDetails['isOrbital']
            ? $this->depHourOffset($depDetails, $legTrajectory, $orbTrajectory, $this->config->stepSize(), $tripData['priorOrbitDur'])
            : [
                'hourOff' => 0,
                'diffDeg' => 0,
                'arcHour' => 0,
                'priorOrbitDur' => 0,
            ];

        // Actual Departure Time
        $legStart = $timeStart + ($depOffset['hourOff'] * 3600);
        $departureTime = date('Y-m-d h:i A', $legStart);

        // Final Coordinate Offset for Departure
        if ($depDetails['isOrbital']) {
            if ($departure == 'ear') {
                $timeStart = $this->earthDepartureOffset($departure, $tripData['nextDep'] + ($depOffset['hourOff'] * 3600), $depDetails);
                $phaseShift = ($timeStart - $depDetails['offset']);
                $trajectory = ($phaseShift / $depDetails['orbitalPeriod']) * 360 + 0.25 * 360 + $tripData['initTraj'] * 360;
                $depAdj = $this->calculator->orbitalAdjustments($depDetails, $trajectory, $phaseShift);
            } else {
                $trajectory = $legTrajectory;
                $depAdj = $this->calculator->orbitalAdjustments($depDetails, $trajectory);
            }
        }

        // Set Updated Departure Coordinates
        $finDepCoordinates = [];
        $depCoordinates = $this->calculator->coordBuild($depDetails, $depData, $tripData['nextDep'] + ($depOffset['hourOff'] * 3600));
        $finDepCoordinates['x'] = $depCoordinates['x'] + $depAdj['x'];
        $finDepCoordinates['y'] = $depCoordinates['y'] + $depAdj['y'];
        $finDepCoordinates['z'] = $depCoordinates['z'] + $depAdj['z'];

        // Set No-Burn Offset
        $depNoBurn = $this->noBurnOffset($depDetails);
        $arrNoBurn = $this->noBurnOffset($arrDetails);

        // Calculate Distance
        $legDistance = $this->calculator->legDistance($finDepCoordinates, $initArrCoordinates, $depNoBurn, $arrNoBurn);

        // Calculate Cruise/Flip Details
        $tripAcceleration = $this->config->tripAcceleration();
        $initLegDetails = $this->calcLegDetails($legDistance['full'], $tripAcceleration, $tripSettings['flip'], $tripSettings['ratio'], $depNoBurn, $arrNoBurn);     // TODO: This output is accurate for Observatory

        // Observatory or Loop Through Options
        $arrCoordinates = $finArrCoordinates = [];
        if (! $arrDetails['isOrbital']) {

            // Final Details for Non-Orbital
            $finalLegDetails = $initLegDetails;
            $obsDuration = ($finalLegDetails['accelerationDuration'] * 2);
            $obsDuration += ($finalLegDetails['cruiseDistance'] > 0) ? $finalLegDetails['cruiseDuration'] : $finalLegDetails['flipDuration'];
            $legDuration = round($obsDuration - ($depNoBurn['duration'] + $arrNoBurn['duration']));

            // Arrival Time
            $arrivalTimeStamp = $legStart + $legDuration;
            $arrivalTime = date('Y-m-d h:i A', $arrivalTimeStamp);

            // Layover
            $layover = $legSegment['arr']['dur'] * 86400;
            $arrData = [
                'x' => $arrDetails['x'],
                'y' => $arrDetails['y'],
                'z' => $arrDetails['z'],
            ];
            $arrCoordinates = $arrData;
            $finArrCoordinates = $arrData;

        } else {

            // Parse Estimate Details
            $initEstimate = ($initLegDetails['accelerationDuration'] * 2);
            $initEstimate += ($initLegDetails['cruiseDistance'] > 0) ? $initLegDetails['cruiseDuration'] : $initLegDetails['flipDuration'];
            $legEstimate = $initEstimate - ($depNoBurn['duration'] + $arrNoBurn['duration']);

            // Determine Destination Data Range
            $layover = 0;
            if (isset($arrNextDetails)) {
                $durationMultiplier = ($legSegment['arr']['durType'] === 'orb') ? $arrDetails['orbitalPeriod'] : 86400;
                $layover = $legSegment['arr']['dur'] * $durationMultiplier;
            }

            // New Horizon Range and Search
            $startRange = $legStart + $legEstimate - (86400 * 2);
            $durationSearch = ($legStart + $legEstimate + $layover + (86400 * 2)) - $startRange;
            $stepSize = $this->config->stepSize();

            // Per-leg arrival data must match this trip's current time window.
            // Reusing a prior session's `{body}Data` can freeze later legs at
            // an old arrival coordinate after the user replans a route.
            $arrData = $this->positionQuery(
                $arrDetails['code'],
                $arrDetails['horizonsId'],
                $startRange,
                $stepSize,
                $durationSearch,
                $tripSettings['dataSource'],
            );
            $this->session->set($arrDetails['code'].'Data', $arrData);

            // Begin Search
            $lowest = 1000000000;
            $bestMatch = null;
            foreach ($arrData['data'] as $dataPoint) {

                // Build Timestamp
                $formattedTimestamp = explode('.', $dataPoint['timestamp'])[0];
                $timestamp = strtotime($formattedTimestamp);

                // Parse the Data
                $arrCoordinates = $this->calculator->coordBuild($arrDetails, $arrData, $timestamp);
                $legDistance = $this->calculator->legDistance($finDepCoordinates, $arrCoordinates, $depNoBurn, $arrNoBurn);

                // Calculate Cruise/Flip Details
                $tripAcceleration = $this->config->tripAcceleration();
                $loopLegDetails = $this->calcLegDetails($legDistance['full'], $tripAcceleration, $tripSettings['flip'], $tripSettings['ratio'], $depNoBurn, $arrNoBurn);
                $observedDuration = $loopLegDetails['legDuration'];

                // Compare Arrival Times
                $arrTS = strtotime($dataPoint['timestamp']);
                $difference = abs($arrTS - ($legStart + $observedDuration));
                $arrivalTS = $legStart + $observedDuration;
                $arrivalTime = date('Y-m-d h:i A', $arrivalTS);

                // Check if this is the closest match so far
                if ($difference < $lowest) {
                    $lowest = $difference;

                    // Final Orbital Offset
                    $orbitalAdjustments = $this->calculator->orbitalAdjustments($arrDetails, $legTrajectory);

                    $finalCoordinates = [
                        'x' => $arrCoordinates['x'] + $orbitalAdjustments['x'],
                        'y' => $arrCoordinates['y'] + $orbitalAdjustments['y'],
                        'z' => $arrCoordinates['z'] + $orbitalAdjustments['z'],
                    ];

                    $bestMatch = [
                        'arrivalTS' => $arrivalTS,
                        'arrivalTime' => $arrivalTime,
                        'arrCoordinates' => $arrCoordinates,
                        'finalCoordinates' => $finalCoordinates,
                        'legDetails' => $loopLegDetails,
                    ];
                }
            }

            // Arrival Results
            $finalLegDetails = $bestMatch['legDetails'];
            $arrivalTimeStamp = $bestMatch['arrivalTS'];
            $arrivalTime = $bestMatch['arrivalTime'];
            $arrCoordinates = $bestMatch['arrCoordinates'];
            $finArrCoordinates = $bestMatch['finalCoordinates'];
        }

        // If Next Segment Exists, Start Processing Layover and Next Departure
        $layoverDetails = [
            'duration' => $layover,
            'durationFormatted' => 0,
            'quantity' => 0,
            'quantityFormatted' => 0,
            'distance' => 0,
            'distanceFormatted' => 0,
        ];

        $nextDepFinal = $nextDepFinalDate = $nextDepFinalTime = null;
        if (isset($arrNextDetails)) {

            // Rename Variables for Clarity
            $depNextDetails = $arrDetails;
            $depNextData = $arrData;

            // Set Leg Abbreviations
            $departureNext = $depNextDetails['code'];

            // Offset Next Departure Based on Step Size
            $stepSize = $this->config->stepSize();
            $depNextTS = $arrivalTimeStamp + $layover;
            $depNextMin = intval(date('H', $depNextTS)) * 60 + intval(date('i', $depNextTS));
            $depNextOffset = ($stepSize - ($depNextMin % $stepSize)) % $stepSize;
            $depNextSec = $depNextOffset * 60 - date('s', $depNextTS);
            $depNextTS += $depNextSec;
            $baseLayover = $depNextTS - $arrivalTimeStamp;

            $layoverDetails = [
                'duration' => $baseLayover,
                'durationFormatted' => secondsToDuration($baseLayover),
                'quantity' => 0,
                'quantityFormatted' => 0,
                'distance' => 0,
                'distanceFormatted' => 0,
            ];

            // Next Coordinates
            $depNextCoordinates = $this->calculator->coordBuild($depNextDetails, $depNextData, $depNextTS);
            $arrNextCoordinates = $this->calculator->coordBuild($arrNextDetails, $arrNextData, $depNextTS);

            // Determine Next Leg Trajectory
            $delNextX = $arrNextCoordinates['x'] - $depNextCoordinates['x'];
            $delNextY = $arrNextCoordinates['y'] - $depNextCoordinates['y'];
            $legNextTrajectory = $this->calculator->trajectory($delNextX, $delNextY, false);

            // Find Position in Orbit for Start of Next Search
            $initNextTraj = $legNextTrajectory;
            if ($depNextDetails['isOrbital']) {
                $orbits = $layover / $depNextDetails['orbitalPeriod'];
                $initNextTraj = $legTrajectory + (($orbits - floor($orbits)) * 360);
                if ($initNextTraj > 360) {
                    $initNextTraj = $initNextTraj - 360;
                }
            }

            // Departure Coordinate Adjustment
            $depNextAdj = [
                'x' => 0,
                'y' => 0,
            ];

            if ($depNextDetails['isOrbital']) {
                $depNext = $this->earthDepartureOffset($departureNext, $initNextTraj, $depNextDetails);
                $phaseShift = ($depNext - $depNextDetails['offset']);
                $trajectory = ($phaseShift / $depNextDetails['orbitalPeriod']) * 360 + 0.25 * 360 + $initNextTraj * 360;
                $depNextAdj = $this->calculator->orbitalAdjustments($depNextDetails, $trajectory, $phaseShift);
            }

            // Set Orbital Trajectory
            $orbNextTrajectory = $initNextTraj > 0
                ? $initNextTraj
                : $this->calculator->trajectory($depNextAdj['x'], $depNextAdj['y'], true);

            // Departure Offset for Orbital
            $depNextOffset = $depNextDetails['isOrbital']
                ? $this->depHourOffset($depNextDetails, $legNextTrajectory, $orbNextTrajectory, $this->config->stepSize(), $tripData['priorOrbitDur'])
                : [
                    'hourOff' => 0,
                    'diffDeg' => 0,
                    'arcHour' => 0,
                    'priorOrbitDur' => 0,
                ];

            // Finalized Details
            $nextDepFinal = $depNextTS + ($depNextOffset['hourOff'] * 3600);
            $nextDepFinalDate = date('Y-m-d', $nextDepFinal);
            $nextDepFinalTime = date('h:i A', $nextDepFinal);
            if ($depNextDetails['isOrbital']) {
                $orbDuration = $nextDepFinal - $arrivalTimeStamp;
                $orbDurationFormatted = secondsToDuration($orbDuration);
                $orbQuantity = $orbDuration / $depNextDetails['orbitalPeriod'];
                $orbDistance = $orbQuantity * (2 * pi() * ($depNextDetails['radius'] + $depNextDetails['orbitalAltitude']));
                $layoverDetails = [
                    'duration' => $orbDuration,
                    'durationFormatted' => $orbDurationFormatted,
                    'quantity' => $orbQuantity,
                    'quantityFormatted' => round($orbQuantity, 2),
                    'distance' => $orbDistance,
                    'distanceFormatted' => number_format(round($orbDistance)),
                ];
            }
        }

        return [
            // Leg
            'leg' => $legNumber,

            // Trajectory Information
            'searchStart' => $tripData['nextDep'],
            'departure' => $departure,
            'arrival' => $arrival,
            'initTrajectory' => $orbTrajectory,
            'legTrajectory' => $legTrajectory,
            'depOffset' => $depOffset,

            // Departure Coordinates
            'initDepCoordinates' => $initDepCoordinates,
            'depAdj' => $depAdj,
            'depCoordinates' => $depCoordinates,
            'finDepCoordinates' => $finDepCoordinates,

            // Arrival Coordinates
            'initArrCoordinates' => $initArrCoordinates,
            'arrAdj' => $arrAdj,
            'arrCoordinates' => $arrCoordinates,
            'finArrCoordinates' => $finArrCoordinates,

            // Departure Planet
            'departureTime' => $departureTime,
            'depDetails' => $depDetails,
            'depNoBurn' => $depNoBurn,

            // Burn and Cruise Details
            'legDistance' => $legDistance,
            'finalLegDetails' => $finalLegDetails,

            // Arrival Planet
            'arrivalTime' => $arrivalTime,
            'arrDetails' => $arrDetails,
            'arrNoBurn' => $arrNoBurn,
            'layoverDetails' => $layoverDetails,

            // Next Trip
            'nextDep' => $nextDepFinal,
            'nextDepDate' => $nextDepFinalDate,
            'nextDepTime' => $nextDepFinalTime,
        ];
    }

    /**
     * Builds the trip legs based on the provided destination data.
     *
     * @param  array  $destinationsData  An array of destinations for the trip.
     * @return array An array of associative arrays, each representing a leg of the trip.
     */
    private function buildLegs(array $destinationsData): array
    {
        $tripLegs = [];
        for ($i = 0; $i < count($destinationsData) - 1; $i++) {
            $leg = [
                'dep' => $destinationsData[$i],
                'arr' => $destinationsData[$i + 1],
            ];
            $tripLegs[] = $leg;
        }

        return $tripLegs;
    }

    /**
     * @throws GuzzleException
     */
    private function positionQuery(
        string $code,
        string|int $horizonsId,
        int $legStart,
        int $stepSize,
        int $durationSearch,
        string $dataSource,
    ): string|array|null {
        if ($dataSource === DestinationService::DATA_SOURCE_EPHEMERIS) {
            return $this->approximateEphemerisService->query(
                $code,
                $legStart,
                $stepSize,
                $durationSearch,
            );
        }

        return $this->horizonService->horizonQuery(
            (string) $horizonsId,
            $legStart,
            $stepSize,
            $durationSearch,
        );
    }

    /**
     * Calculates various details for a single leg of a space trip, including
     * acceleration, cruise, and flip phases, as well as time dilation effects.
     *
     * @param  float  $legDistance  The distance of the trip leg in kilometers.
     * @param  float  $tripAcceleration  The acceleration in m/s² for the trip.
     * @param  float  $flipDur  The duration of the flip maneuver in seconds.
     * @param  float  $tripCruiseRatio  The ratio of the cruise phase to the total trip.
     * @param  array  $depNoBurn  The no-burn offset for the departure destination.
     * @param  array  $arrNoBur  The no-burn offset for the arrival destination.
     *
     * This function computes the duration and distance for the acceleration and
     * deceleration phases, as well as for the cruise and flip phases, if applicable.
     * It also calculates the time dilation effect for each phase based on the
     * relativistic effects at high speeds.
     *
     * Note: The speed of light (`$sol`) and the maximum speed of the trip
     * (`$tripMaxSpeed`) are retrieved within the function from a constants helper
     * and the application configuration, respectively.
     * @return array Returns an associative array containing the details of the leg,
     *               including maximum speed, distances and durations for acceleration, cruise,
     *               and flip phases, as well as the total time dilation for the leg.
     */
    public function calcLegDetails(float $legDistance, float $tripAcceleration, float $flipDur, float $tripCruiseRatio, array $depNoBurn, array $arrNoBur): array
    {

        // Speed of Light Constant
        $sol = constants('c');

        // Initialize Info Arrays
        $cruiseInfo = $flipInfo = [
            'distance' => 0,
            'duration' => 0,
            'durationDilation' => 0,
            'dilation' => 0,
        ];

        // Acceleration Distance
        $accelerationDistance = $legDistance * 1000 / 2;

        // Acceleration Duration
        $accelerationDuration = $this->accelDuration->calc('duration', [
            ['distance', $accelerationDistance], ['acceleration', $tripAcceleration]]);

        // Max Speed (No Cruise / Flip)
        $legMaxSpeed = $this->relativisticSpeed->calc('maximumSpeed', [
            ['acceleration', $tripAcceleration], ['duration', $accelerationDuration]]);

        if ($tripCruiseRatio > 0) {
            // If Cruise Ratio is Set, Scale Back from Top Speed
            $accelerationDuration = $accelerationDuration * (1 - $tripCruiseRatio);
            $accelerationDistance = ((pow($sol, 2) / $tripAcceleration) * (sqrt(1 + ((pow($tripAcceleration, 2) * pow($accelerationDuration, 2)) / pow($sol, 2))) - 1));

            // Calculating Cruise Metrics
            $legMaxSpeed = $this->relativisticSpeed->calc('maximumSpeed', [
                ['acceleration', $tripAcceleration], ['duration', $accelerationDuration]]);
            $cruiseInfo = $this->calculator->disDurDil($legDistance, $legMaxSpeed, $accelerationDistance);

        } elseif ($flipDur > 0) {
            // Do a Backflip!
            $accelerationDuration = $accelerationDuration - ($flipDur / 2);
            $accelerationDistance = pow($sol, 2) / $tripAcceleration * (sqrt(1 + pow(($tripAcceleration * $accelerationDuration / $sol), 2)) - 1);

            // Calculate Flip Metrics
            $legMaxSpeed = $this->relativisticSpeed->calc('maximumSpeed', [
                ['acceleration', $tripAcceleration], ['duration', $accelerationDuration]]);
            $flipInfo = $this->calculator->disDurDil($legDistance, $legMaxSpeed, $accelerationDistance);

        }

        // Modify No-Burn Offsets
        $finalAccDistance = $accelerationDistance - $depNoBurn['distance'];
        $finalAccDuration = $accelerationDuration - $depNoBurn['duration'];
        $finalDecDistance = $accelerationDistance - $arrNoBur['distance'];
        $finalDecDuration = $accelerationDuration - $arrNoBur['duration'];

        // Final Distance and Duration
        $legDistance = $finalAccDistance + $cruiseInfo['distance'] + $flipInfo['distance'] + $finalDecDistance;
        $legDuration = $finalAccDuration + $cruiseInfo['duration'] + $flipInfo['duration'] + $finalDecDuration;

        // Calculate Acceleration Dilation
        $accelerationDurationDilation = $sol / $tripAcceleration * asinh($tripAcceleration * $accelerationDuration / $sol);
        $accelerationDilation = $accelerationDuration - $accelerationDurationDilation;
        $legDilation = ($accelerationDilation * 2) + $cruiseInfo['dilation'] + $flipInfo['dilation'];

        // Render Display Values
        $legDurationFormatted = secondsToDuration($legDuration);
        $legDilationFormatted = secondsToDuration($legDilation);
        $accBurnDurationFormatted = secondsToDuration($finalAccDuration);
        $decBurnDurationFormatted = secondsToDuration($finalDecDuration);
        $accelerationDurationFormatted = secondsToDuration($finalAccDuration + $finalDecDuration);
        $burnDurationFormatted = secondsToDuration($finalAccDuration + $finalDecDuration);
        $cruiseDurationFormatted = secondsToDuration($cruiseInfo['duration']);
        $cruiseDilationFormatted = secondsToDuration($cruiseInfo['dilation']);
        $flipDurationFormatted = secondsToDuration($flipInfo['duration']);
        $flipDilationFormatted = secondsToDuration($flipInfo['dilation']);

        // Prepare Output
        return [
            // Base Values
            'legMaxSpeed' => $legMaxSpeed,
            'legMaxSpeedFormatted' => number_format(round($legMaxSpeed)),
            'legDistance' => $legDistance / 1000,
            'legDistanceFormatted' => number_format(round($legDistance / 1000)),
            'legDuration' => $legDuration,
            'legDurationFormatted' => $legDurationFormatted,
            'legDilation' => $legDilation,
            'legDilationFormatted' => $legDilationFormatted,

            // Full
            'accelerationDistance' => $accelerationDistance / 1000,
            'accelerationDistanceFormatted' => number_format(round($accelerationDistance / 1000)),
            'accelerationDuration' => $accelerationDuration,
            'accelerationDurationFormatted' => $accelerationDurationFormatted,

            // With No Burn
            'accBurnDistance' => $finalAccDistance / 1000,
            'accBurnDistanceFormatted' => number_format(round($finalAccDistance / 1000)),
            'accBurnDuration' => $finalAccDuration,
            'accBurnDurationFormatted' => $accBurnDurationFormatted,
            'decBurnDistance' => $finalDecDistance / 1000,
            'decBurnDistanceFormatted' => number_format(round($finalDecDistance / 1000)),
            'decBurnDuration' => $finalDecDuration,
            'decBurnDurationFormatted' => $decBurnDurationFormatted,
            'burnDistance' => ($finalAccDistance + $finalDecDistance) / 1000,
            'burnDistanceFormatted' => number_format(round(($finalAccDistance + $finalDecDistance) / 1000)),
            'burnDuration' => $finalAccDuration + $finalDecDuration,
            'burnDurationFormatted' => $burnDurationFormatted,

            // Cruise and/or Flip
            'cruiseDistance' => $cruiseInfo['distance'] / 1000,
            'cruiseDistanceFormatted' => number_format(round($cruiseInfo['distance'] / 1000)),
            'cruiseDuration' => $cruiseInfo['duration'],
            'cruiseDurationFormatted' => $cruiseDurationFormatted,
            'cruiseDilation' => $cruiseInfo['dilation'],
            'cruiseDilationFormatted' => $cruiseDilationFormatted,
            'flipDistance' => $flipInfo['distance'] / 1000,
            'flipDistanceFormatted' => number_format(round($flipInfo['distance'] / 1000)),
            'flipDuration' => $flipInfo['duration'],
            'flipDurationFormatted' => $flipDurationFormatted,
            'flipDilation' => $flipInfo['dilation'],
            'flipDilationFormatted' => $flipDilationFormatted,
        ];
    }

    /**
     * Calculates the departure time for Earth based on its geostationary orbit.
     *
     * @param  string  $departure  The departure destination code.
     * @param  int  $legStart  The start time of the leg as a Unix timestamp.
     * @param  array  $depDetails  Details of the departure destination.
     * @return int The calculated departure time.
     */
    private function earthDepartureOffset(string $departure, int $legStart, array $depDetails): int
    {
        if ($departure === 'ear') {
            // Extract Longitude Configuration
            $longitude = $this->config->earthGeoLongitude();
            $ew = strtolower(substr($longitude, -1));
            $degrees = trim(substr($longitude, 0, -1));

            // Calculate the Seconds Offset Based on the Degrees and Orbital Period
            $secOff = round($degrees * $depDetails['orbitalPeriod'] / 360);

            // Adjust for East or West
            $adjustedTime = ($ew === 'w') ? $legStart - $secOff : $legStart + $secOff;

            // Get Step Size in Seconds
            $stepSize = $this->config->stepSize() * 60;

            // Round to the Nearest Step Size
            $remainder = $adjustedTime % $stepSize;
            if ($remainder < $stepSize / 2) {
                $adjustedTime -= $remainder;
            } else {
                $adjustedTime += ($stepSize - $remainder);
            }

            return $adjustedTime;
        }

        return $legStart;
    }

    /**
     * Calculates the departure hour offset, degree difference, arc hour, and final prior orbit duration for a given leg of a space cruise.
     *
     * @param  array  $depDetails  The array of details for the departure destination including 'code' and 'orbitalPeriod'.
     * @param  float  $legTrajectory  The trajectory angle of the leg in degrees.
     * @param  float  $orbitalTrajectory  The orbital trajectory angle in degrees.
     * @param  float  $stepSize  The step size in minutes used for calculating time offsets.
     * @param  float  $priorOrbitDuration  Optional. The duration of the prior orbit in seconds. Defaults to 0.
     * @return array An associative array containing 'depHourOff' (departure hour offset in hours),
     *               'diffDeg' (difference in degrees between leg trajectory and orbital trajectory),
     *               'arcHour' (the arc hour value for calculating the departure hour offset),
     *               and 'finalPriorOrbitDur' (the adjusted prior orbit duration in seconds).
     */
    public function depHourOffset(array $depDetails, float $legTrajectory, float $orbitalTrajectory, float $stepSize, float $priorOrbitDuration = 0): array
    {
        $diffDeg = 0;
        $depHourOff = 0;
        $arcHour = 0;
        $finalPriorOrbitDur = 0;

        if ($depDetails['isOrbital']) {
            $diffDeg = $legTrajectory - $orbitalTrajectory;

            if ($diffDeg < 0) {
                $diffDeg += 360;
            }

            $arcHour = (360 / 24) * (86400 / $depDetails['orbitalPeriod']);

            if ($diffDeg > 10) {
                $stepDay = 1440 / $stepSize;
                $depHourOff = ceil(($diffDeg / $arcHour) * ($stepDay / 24)) / ($stepDay / 24);
            }

            if ($depHourOff == 24) {
                $depHourOff = 0;
            }

            $finalPriorOrbitDur = $priorOrbitDuration > 0 ? $depHourOff * 3600 : 0;
        }

        return [
            'hourOff' => $depHourOff,
            'diffDeg' => $diffDeg,
            'arcHour' => $arcHour,
            'priorOrbitDur' => $finalPriorOrbitDur,
        ];
    }

    /**
     * Calculates the no-burn duration and distance for departure from an orbital body.
     *
     * @param  array  $locDetails  Details of the departure location.
     * @return array Array containing no-burn duration and distance.
     */
    private function noBurnOffset(array $locDetails): array
    {
        $acceleration = config('experiences.space_cruise.trip_acceleration');
        $noBurnDuration = $noBurnDistance = 0;

        if ($locDetails['isOrbital']) {
            $noBurnDuration = $locDetails['orbitalVelocity'] / $acceleration;
            $noBurnDistance = 0.5 * $acceleration * pow($noBurnDuration, 2) / 1000;
        }

        return [
            'duration' => $noBurnDuration,
            'distance' => $noBurnDistance,
        ];
    }
}
