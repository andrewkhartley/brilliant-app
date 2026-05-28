<?php

/*
 * Cruise experience configuration.
 *
 * These keys are read by App\Services\Experiences\Cruise\ConfigService
 * (lifted from undaunted-app-old in P2.T6). The defaults match the
 * `config(key, default)` fallbacks in that service. undaunted-app-old
 * didn't include this config file; the service relied on defaults.
 * Making the file explicit here lets a reader see what's configurable.
 */

return [

    'space_cruise' => [

        // Enables verbose troubleshooting output in the trip-builder.
        'troubleshoot' => false,

        // Operational mode. Default: 'orbital'.
        'mode' => 'orbital',

        // Earth's geostationary longitude reference (deg + direction).
        'longitude' => '180W',

        // Step size for Horizon API calls, in minutes.
        'step_size' => 120,

        // Period step for Horizon queries, in days.
        'period_step' => 14,

        // Period duration for Horizon queries, in seconds (default = 1 year).
        'period_duration' => 31_536_000,

        // Maximum trip speed in meters per second (0 = use computed).
        'trip_max_speed' => 0,

        // Acceleration in m/s^2 (default = standard Earth gravity).
        'trip_acceleration' => 9.80665,

    ],

];
