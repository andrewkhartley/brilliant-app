/**
 * Physics constants used by the equation registry.
 *
 * Mirrors the PHP-side `constants($key)` helper at app/Helpers/constants.php,
 * scaled to only what the v1 equation registry needs. Other constants from
 * the PHP helper can be added as equations require them.
 */

/** Speed of light in vacuum, in meters per second. */
export const SPEED_OF_LIGHT = 299_792_458;

/** Gravitational constant, in m³·kg⁻¹·s⁻². */
export const GRAVITATIONAL_CONSTANT = 6.674_30e-11;

/** Standard gravity at Earth's surface, in m/s². */
export const STANDARD_GRAVITY = 9.806_65;
