<?php

namespace App\Services\Experiences\Cruise;

use App\Models\Experiences\Cruise\Destination;
use App\Services\Sessions\SessionManager;

class ApproximateEphemerisService
{
    private const float AU_KM = 149_597_870.7;

    private const int J2000_TIMESTAMP = 946728000;

    public function __construct(private readonly SessionManager $session) {}

    public function addEphemerisData(array $destinationsData, int $legStart, int $stepSizeMinutes, int $durationSeconds): array
    {
        $queriedDestinations = [];

        foreach ($destinationsData as $destination) {
            $code = $destination['destination'];

            if (in_array($code, $queriedDestinations, true) || $code === 'obs') {
                continue;
            }

            $this->session->set(
                $code.'PeriodData',
                $this->query($code, $legStart, $stepSizeMinutes, $durationSeconds),
            );

            $queriedDestinations[] = $code;
        }

        return $destinationsData;
    }

    public function query(string $code, int $legStart, int $stepSizeMinutes, int $durationSeconds): array
    {
        $stepSeconds = max(60, $stepSizeMinutes * 60);
        $start = strtotime(date('Y-m-d 00:00:00', $legStart));
        $end = $start + $durationSeconds;
        $data = [];

        for ($timestamp = $start; $timestamp <= $end; $timestamp += $stepSeconds) {
            $coordinates = $this->position($code, $timestamp);

            $data[] = [
                'timestamp' => gmdate('Y-m-d H:i:s', $timestamp),
                'x' => $coordinates['x'],
                'y' => $coordinates['y'],
                'z' => $coordinates['z'],
            ];
        }

        return [
            'id' => $code,
            'stepSize' => $stepSizeMinutes,
            'duration' => $durationSeconds / 86400,
            'entries' => count($data),
            'source' => 'approximate-ephemeris',
            'data' => $data,
        ];
    }

    public function positionAt(string $code, int $timestamp): array
    {
        return $this->position($code, $timestamp);
    }

    private function position(string $code, int $timestamp): array
    {
        if ($code === 'sun') {
            return ['x' => 0.0, 'y' => 0.0, 'z' => 0.0];
        }

        if ($code === 'obs') {
            return ['x' => 0.0, 'y' => 0.0, 'z' => 4_487_936_121.0];
        }

        $localBody = EphemerisCatalog::body($code);

        if ($localBody !== null && isset($localBody['parent'])) {
            $parent = $this->position($localBody['parent'], $timestamp);
            $offset = $this->circularPosition(
                $localBody['parentDistanceKm'],
                $localBody['periodDays'],
                $localBody['phaseDeg'],
                $localBody['inclinationDeg'],
                $timestamp,
            );

            return [
                'x' => $parent['x'] + $offset['x'],
                'y' => $parent['y'] + $offset['y'],
                'z' => $parent['z'] + $offset['z'],
            ];
        }

        if ($localBody !== null) {
            return $this->circularPosition(
                $localBody['semiMajorAu'] * self::AU_KM,
                $localBody['periodDays'],
                $localBody['phaseDeg'],
                $localBody['inclinationDeg'],
                $timestamp,
            );
        }

        $destination = Destination::getCachedFacts()->firstWhere('destination_code', $code);

        if ($destination === null) {
            return ['x' => 0.0, 'y' => 0.0, 'z' => 0.0];
        }

        $semiMajorAu = (float) $destination->axis_len;
        $periodDays = (float) $destination->solar_orbit;

        if ($semiMajorAu <= 0 || $periodDays <= 0) {
            return [
                'x' => (float) $destination->x_coord,
                'y' => (float) $destination->y_coord,
                'z' => (float) $destination->z_coord,
            ];
        }

        return $this->elementPosition($destination, $timestamp);
    }

    private function circularPosition(
        float $radiusKm,
        float $periodDays,
        float $phaseDeg,
        float $inclinationDeg,
        int $timestamp,
    ): array {
        $days = ($timestamp - self::J2000_TIMESTAMP) / 86400;
        $angle = deg2rad($phaseDeg + (($days / $periodDays) * 360));
        $inclination = deg2rad($inclinationDeg);

        return [
            'x' => $radiusKm * cos($angle),
            'y' => $radiusKm * sin($angle),
            'z' => $radiusKm * sin($inclination) * sin($angle),
        ];
    }

    private function elementPosition(Destination $destination, int $timestamp): array
    {
        $centuries = ($timestamp - self::J2000_TIMESTAMP) / (36525 * 86400);
        $semiMajorAu = $this->correctedElement($destination->axis_len, $destination->axis_len_corr, $centuries);
        $eccentricity = $this->correctedElement($destination->eccentricity, $destination->eccentricity_corr, $centuries);
        $inclination = deg2rad($this->correctedElement($destination->inclination, $destination->inclination_corr, $centuries / 3600));
        $longitudeAscendingNode = deg2rad($this->normalizeDegrees(
            $this->correctedElement($destination->long_asc, $destination->long_asc_corr, $centuries / 3600),
        ));
        $longitudePerihelion = deg2rad($this->normalizeDegrees(
            $this->correctedElement($destination->long_peri, $destination->long_peri_corr, $centuries / 3600),
        ));
        $meanLongitude = deg2rad($this->normalizeDegrees(
            $this->correctedElement($destination->long_mean, $destination->long_mean_corr, $centuries / 3600),
        ));
        $argumentPerihelion = $longitudePerihelion - $longitudeAscendingNode;
        $meanAnomaly = $this->normalizeRadians($meanLongitude - $longitudePerihelion);
        $eccentricAnomaly = $this->solveEccentricAnomaly($meanAnomaly, $eccentricity);

        $xPrime = $semiMajorAu * (cos($eccentricAnomaly) - $eccentricity);
        $yPrime = $semiMajorAu * sqrt(1 - ($eccentricity * $eccentricity)) * sin($eccentricAnomaly);
        $cosNode = cos($longitudeAscendingNode);
        $sinNode = sin($longitudeAscendingNode);
        $cosArgument = cos($argumentPerihelion);
        $sinArgument = sin($argumentPerihelion);
        $cosInclination = cos($inclination);
        $sinInclination = sin($inclination);

        $xAu = ($cosArgument * $cosNode - $sinArgument * $sinNode * $cosInclination) * $xPrime
            + (-$sinArgument * $cosNode - $cosArgument * $sinNode * $cosInclination) * $yPrime;
        $yAu = ($cosArgument * $sinNode + $sinArgument * $cosNode * $cosInclination) * $xPrime
            + (-$sinArgument * $sinNode + $cosArgument * $cosNode * $cosInclination) * $yPrime;
        $zAu = ($sinArgument * $sinInclination) * $xPrime
            + ($cosArgument * $sinInclination) * $yPrime;

        return [
            'x' => $xAu * self::AU_KM,
            'y' => $yAu * self::AU_KM,
            'z' => $zAu * self::AU_KM,
        ];
    }

    private function correctedElement(mixed $base, mixed $correction, float $centuries): float
    {
        return (float) $base + ((float) $correction * $centuries);
    }

    private function solveEccentricAnomaly(float $meanAnomaly, float $eccentricity): float
    {
        $eccentricAnomaly = $eccentricity < 0.8 ? $meanAnomaly : pi();

        for ($i = 0; $i < 12; $i++) {
            $delta = ($eccentricAnomaly - $eccentricity * sin($eccentricAnomaly) - $meanAnomaly)
                / (1 - $eccentricity * cos($eccentricAnomaly));
            $eccentricAnomaly -= $delta;

            if (abs($delta) < 1e-9) {
                break;
            }
        }

        return $eccentricAnomaly;
    }

    private function normalizeDegrees(float $degrees): float
    {
        $normalized = fmod($degrees, 360.0);

        return $normalized < 0 ? $normalized + 360.0 : $normalized;
    }

    private function normalizeRadians(float $radians): float
    {
        $normalized = fmod($radians, 2 * pi());

        return $normalized < 0 ? $normalized + 2 * pi() : $normalized;
    }
}
