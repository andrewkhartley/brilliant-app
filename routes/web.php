<?php

use App\Http\Controllers\API\HorizonController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\Playground\SceneDebugController;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingController::class)->name('home');

Route::get('/api/horizon/query', [HorizonController::class, 'queryHorizon'])
    ->name('horizon.query');

Route::get('/playground/scene-debug', SceneDebugController::class)
    ->name('playground.scene-debug');
