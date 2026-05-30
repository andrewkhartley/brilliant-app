<?php

use App\Http\Controllers\AboutController;
use App\Http\Controllers\API\HorizonController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\Playground\ComponentsDebugController;
use App\Http\Controllers\Playground\CruiseController;
use App\Http\Controllers\Playground\EquationsDebugController;
use App\Http\Controllers\Playground\InterstellarController;
use App\Http\Controllers\Playground\SceneDebugController;
use App\Http\Controllers\PlaygroundController;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingController::class)->name('home');

Route::get('/about', AboutController::class)->name('about.index');

Route::get('/api/horizon/query', [HorizonController::class, 'queryHorizon'])
    ->name('horizon.query');

Route::get('/playground', PlaygroundController::class)
    ->name('playground.index');

Route::get('/playground/scene-debug', SceneDebugController::class)
    ->name('playground.scene-debug');

Route::get('/playground/components-debug', ComponentsDebugController::class)
    ->name('playground.components-debug');

Route::get('/playground/equations-debug', EquationsDebugController::class)
    ->name('playground.equations-debug');

Route::get('/playground/interstellar', InterstellarController::class)
    ->name('playground.interstellar');

Route::get('/playground/cruise', [CruiseController::class, 'create'])
    ->name('playground.cruise');
