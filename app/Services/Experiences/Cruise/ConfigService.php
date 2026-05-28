<?php

namespace App\Services\Experiences\Cruise;

class ConfigService
{
    /**
     * Retrieve the flag for enabling troubleshooting mode.
     *
     * @return bool Indicates if troubleshooting mode is enabled.
     */
    public function isTroubleshoot(): bool
    {
        return config('experiences.space_cruise.troubleshoot', false);
    }

    /**
     * Retrieve the operational mode for the system.
     *
     * @return string The operational mode ('orbital' as default).
     */
    public function mode(): string
    {
        return config('experiences.space_cruise.mode', 'orbital');
    }

    /**
     * Retrieve the longitude configuration for Earth's geostationary position.
     *
     * @return string Longitude in degrees followed by direction (e.g., '0.8 W').
     */
    public function earthGeoLongitude(): string
    {
        return config('experiences.space_cruise.longitude', '180W');
    }

    /**
     * Retrieve the step size for Horizon API calls in minutes.
     *
     * @return int Step size in minutes.
     */
    public function stepSize(): int
    {
        return config('experiences.space_cruise.step_size', 120);
    }

    /**
     * Retrieve the period step for Horizon queries in days.
     *
     * @return int Period step in days.
     */
    public function periodStep(): int
    {
        return config('experiences.space_cruise.period_step', 14);
    }

    /**
     * Retrieve the period duration for Horizon queries in seconds.
     *
     * @return int Duration in seconds.
     */
    public function periodDuration(): int
    {
        return config('experiences.space_cruise.period_duration', 31536000);
    }

    /**
     * Retrieve the maximum speed for space trips in meters per second.
     *
     * @return float Max speed in meters per second.
     */
    public function tripMaxSpeed(): float
    {
        return config('experiences.space_cruise.trip_max_speed', 0);
    }

    /**
     * Retrieve the acceleration for space trips in meters per second squared.
     *
     * @return float Acceleration in meters per second squared.
     */
    public function tripAcceleration(): float
    {
        return config('experiences.space_cruise.trip_acceleration', 9.80665);
    }
}
