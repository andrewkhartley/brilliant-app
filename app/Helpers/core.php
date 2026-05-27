<?php

/*
 * Cherry-picked from undaunted-app-old/app/Helpers/core.php (~2023, pre-AI).
 * Original contained DebugLog, getAllRoles, renderRole, secondsToDuration.
 * Only DebugLog and secondsToDuration are needed here; the role helpers
 * referenced App\Models\Bridge\Permissions\Role which doesn't exist in this
 * project's domain.
 */

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

// ###################################################################
//
//   Debug Log
//   Log a debug message if the application is in debug mode.
//
// ###################################################################

if (! function_exists('DebugLog')) {

    /**
     * @param  string  $level  The log level (e.g., 'info', 'error').
     * @param  string  $message  The log message.
     * @param  array  $context  Additional contextual data.
     * @param  string|null  $channel  Optional channel to log into.
     */
    function DebugLog(string $level, string $message, array $context = [], ?string $channel = null): void
    {
        if (Config::get('app.debug')) {
            // Check if Channel is Set
            if ($channel) {
                $log = Log::channel($channel);
                $log->$level($message, $context);
            } else {
                Log::$level($message, $context);
            }
        }
    }
}

// ###################################################################
//
//   Convert Seconds to Visible Duration
//
// ###################################################################

/**
 * Converts seconds into a human-readable duration format.
 *
 * @param  int  $seconds  The number of seconds to convert.
 * @return string A human-readable duration string.
 */
function secondsToDuration(int $seconds): string
{
    $dtF = new DateTime('@0'); // Unix epoch (date at 0 seconds)
    $dtT = new DateTime("@$seconds"); // Date at given seconds
    $interval = $dtF->diff($dtT);

    $days = $interval->format('%a');
    $hours = $interval->format('%h');
    $minutes = $interval->format('%i');
    $seconds = $interval->format('%s');

    $formatted = '';
    if ($days > 0) {
        $formatted .= "$days<span class=\"unit\">d</span> ";
    }
    if ($hours > 0 || $formatted) {
        $formatted .= "$hours<span class=\"unit\">h</span> ";
    }
    if ($minutes > 0 || $formatted) {
        $formatted .= "$minutes<span class=\"unit\">m</span> ";
    }
    $formatted .= "$seconds<span class=\"unit\">s</span>";

    return trim($formatted);
}
