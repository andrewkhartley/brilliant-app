<?php

/*
 * User-facing error messages. Distinct from Laravel's validation/auth
 * messages (which live in framework-published auth.php / validation.php).
 *
 * Universal namespace: always included in the translations bundle
 * via the translations() helper (no per-page declaration needed).
 */

return [
    'horizons' => [
        'timeout' => 'The NASA Horizons API took too long to respond. Try again in a moment.',
        'unavailable' => 'The NASA Horizons API is temporarily unavailable.',
    ],
    'equations' => [
        'invalidInput' => 'One or more inputs are outside the equation\'s valid range.',
    ],
];
