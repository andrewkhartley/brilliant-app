<?php

namespace App\Equations\Geometry;

class CoordinateDistance
{
    /**
     * Return the distance equation in MathJax format.
     *
     * @return string The distance equation.
     */
    public function equation(): string
    {
        return 'd = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2 + (z_2 - z_1)^2}';
    }

    /**
     * Return the legend for the distance equation.
     *
     * @return array The legend explaining each symbol in the distance equation.
     */
    public function eqLegend(): array
    {
        return [
            'd' => 'Distance between two points',
            'x_1' => 'X-coordinate of the first point',
            'x_2' => 'X-coordinate of the second point',
            'y_1' => 'Y-coordinate of the first point',
            'y_2' => 'Y-coordinate of the second point',
            'z_1' => 'Z-coordinate of the first point (optional)',
            'z_2' => 'Z-coordinate of the second point (optional)',
        ];
    }

    /**
     * Calculate the distance between two points.
     *
     * @param  array  $point1  Associative array with keys 'x', 'y', and optionally 'z'.
     * @param  array  $point2  Associative array with keys 'x', 'y', and optionally 'z'.
     * @return float The calculated distance.
     */
    public function calc(array $point1, array $point2): float
    {
        $x1 = $point1['x'] ?? 0;
        $y1 = $point1['y'] ?? 0;
        $z1 = $point1['z'] ?? 0;
        $x2 = $point2['x'] ?? 0;
        $y2 = $point2['y'] ?? 0;
        $z2 = $point2['z'] ?? 0;

        return sqrt(pow($x2 - $x1, 2) + pow($y2 - $y1, 2) + pow($z2 - $z1, 2));
    }
}
