<?php

use App\Http\Controllers\API\HorizonController;
use App\Http\Controllers\LandingController;
use App\Http\Controllers\Playground\AnimationDebugController;
use App\Http\Controllers\Playground\ComponentsDebugController;
use App\Http\Controllers\Playground\CruiseController;
use App\Http\Controllers\Playground\EquationsDebugController;
use App\Http\Controllers\Playground\HabitatController;
use App\Http\Controllers\Playground\InterstellarController;
use App\Http\Controllers\Playground\SceneDebugController;
use App\Http\Controllers\Playground\StoryStageDebugController;
use App\Http\Controllers\PlaygroundController;
use App\Http\Controllers\ProjectsController;
use Illuminate\Support\Facades\Route;

Route::get('/', LandingController::class)->name('home');

Route::get('/projects', ProjectsController::class)->name('projects.index');

Route::get('/api/horizon/query', [HorizonController::class, 'queryHorizon'])
    ->name('horizon.query');

Route::get('/playground', PlaygroundController::class)
    ->name('playground.index');

Route::get('/playground/scene-debug', SceneDebugController::class)
    ->name('playground.scene-debug');

Route::get('/playground/components-debug', ComponentsDebugController::class)
    ->name('playground.components-debug');

Route::get('/playground/animation-debug', AnimationDebugController::class)
    ->name('playground.animation-debug');

Route::get('/playground/story-stage-debug', StoryStageDebugController::class)
    ->name('playground.story-stage-debug');

Route::get('/playground/equations-debug', EquationsDebugController::class)
    ->name('playground.equations-debug');

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
