<?php

use App\Http\Controllers\API\HorizonController;
use App\Http\Controllers\LandingController;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingController::class)->name('home');

Route::get('/api/horizon/query', [HorizonController::class, 'queryHorizon'])
    ->name('horizon.query');
