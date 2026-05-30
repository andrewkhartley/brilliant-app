<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
 * solar_system_facts — lifted verbatim from the 2024-08-14 Undaunted
 * archive (originally migration 0110_01_01_000400). The legacy archive
 * used a named `scales-systems` MySQL connection; in Brilliant this is
 * the first DB-backed domain table on the default SQLite connection
 * (per project-brilliant-db-minimalism), so the named connection has
 * been dropped. The column shapes are preserved exactly so the lifted
 * Cruise service stack (DestinationService, TripBuilderService) keeps
 * working without changes.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solar_system_facts', function (Blueprint $table) {
            $table->id();
            $table->char('destination_code', 3);
            $table->string('destination', 50);
            $table->boolean('horizons');
            $table->integer('horizons_id');
            $table->bigInteger('x_coord');
            $table->bigInteger('y_coord');
            $table->bigInteger('z_coord');
            $table->boolean('orbital');
            $table->decimal('solar_orbit', 10, 5);
            $table->decimal('orbital_period', 10, 5);
            $table->float('orbital_altitude');
            $table->float('mass');
            $table->float('radius');
            $table->float('tilt');
            $table->float('right_asc');
            $table->bigInteger('perihelion');
            $table->bigInteger('aphelion');
            $table->bigInteger('offset');
            $table->decimal('axis_len', 10, 8);
            $table->decimal('eccentricity', 9, 8);
            $table->decimal('inclination', 7, 5);
            $table->decimal('long_asc', 8, 5);
            $table->decimal('long_peri', 8, 5);
            $table->decimal('long_mean', 8, 5);
            $table->decimal('axis_len_corr', 9, 8);
            $table->decimal('eccentricity_corr', 9, 8);
            $table->decimal('inclination_corr', 4);
            $table->decimal('long_asc_corr', 7);
            $table->decimal('long_peri_corr', 6);
            $table->decimal('long_mean_corr', 11);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solar_system_facts');
    }
};
