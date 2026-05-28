<?php

use App\Http\Controllers\API\HorizonController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('/api/horizon/query', [HorizonController::class, 'queryHorizon'])->name('horizon.query');
