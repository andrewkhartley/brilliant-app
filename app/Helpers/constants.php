<?php

// ###################################################################
//
//   Constants
//   Retrieve constants used in mathematics and physics
//
// ###################################################################

function constants($key)
{

    // Define Constants
    $constants = [
        'G' => 6.67430e-11,                             // Gravitational constant in m^3 kg^-1 s^-2
        'c' => 299792458,                               // Speed of light in meters per second
        'gEarth' => 9.80665,                            // Standard gravity on Earth in m/s²
        'eulerNumber' => 2.71828,                       // Euler's Number
        'planckConstant' => 6.62607015e-34,             // Planck's constant in m^2 kg / s
        'elementaryCharge' => 1.602176634e-19,          // Elementary charge in coulombs
        'boltzmannConstant' => 1.380649e-23,            // Boltzmann constant in J/K
        'avogadroNumber' => 6.02214076e+23,             // Avogadro's number
        'standardAtmosphere' => 101325,                 // Standard atmospheric pressure in Pascals
        'speedOfSound' => 343,                          // Speed of sound in air at sea level in m/s
        'stefanBoltzmannConstant' => 5.670374419e-8,    // Stefan-Boltzmann constant in W⋅m^-2⋅K^-4
        'gasConstant' => 8.314462618,                   // Gas constant in J⋅mol^-1⋅K^-1
        'faradayConstant' => 96485.33212,               // Faraday constant in C/mol
        'permeabilityOfFreeSpace' => 4 * M_PI * 1e-7,   // Permeability of free space in H/m (Henry per meter)
        'permittivityOfFreeSpace' => 8.854187817e-12,   // Permittivity of free space in F/m (Farad per meter)
        'molarVolume' => 22.41396954,                   // Molar volume of an ideal gas at STP in L/mol
        'rydbergConstant' => 10973731.568160,           // Rydberg constant in m^-1
    ];

    return $constants[$key] ?? null;
}
