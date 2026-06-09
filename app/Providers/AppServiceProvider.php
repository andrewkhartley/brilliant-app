<?php

namespace App\Providers;

use App\Services\API\HorizonCache;
use App\Services\API\HorizonService;
use App\Services\Sessions\SessionManager;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Transparently wrap the API HorizonService with a persistent file
        // cache. Every consumer that typehints HorizonService (TripBuilderService,
        // Cruise\HorizonService) receives the cache; the cache
        // itself takes a non-cache HorizonService as its upstream, resolved here
        // explicitly to break the recursive binding.
        $this->app->when(HorizonCache::class)
            ->needs(HorizonService::class)
            ->give(fn ($app) => new HorizonService($app->make(SessionManager::class)));

        $this->app->bind(HorizonService::class, HorizonCache::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
