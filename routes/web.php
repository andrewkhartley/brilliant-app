<?php

use App\Http\Controllers\API\InterstellarTargetController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\Playground\CruiseController;
use App\Http\Controllers\Playground\HabitatController;
use App\Http\Controllers\Playground\InterstellarController;
use App\Http\Controllers\PlaygroundController;
use App\Http\Controllers\ProjectsController;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingController::class)->name('home');

Route::get('/projects', ProjectsController::class)->name('projects.index');

Route::get('/api/interstellar/stars', [InterstellarTargetController::class, 'search'])
    ->middleware('throttle:30,1')
    ->name('interstellar.stars.search');

Route::get('/playground', PlaygroundController::class)
    ->name('playground.index');

Route::get('/playground/interstellar', InterstellarController::class)
    ->name('playground.interstellar');

Route::get('/playground/habitat', HabitatController::class)
    ->name('playground.habitat');

Route::get('/playground/cruise', [CruiseController::class, 'create'])
    ->name('playground.cruise');

Route::post('/playground/cruise', [CruiseController::class, 'store'])
    ->name('playground.cruise.store');

Route::get('/playground/cruise/review', [CruiseController::class, 'review'])
    ->name('playground.cruise.review');
