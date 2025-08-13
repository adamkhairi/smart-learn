<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureCommands();
        $this->configureModels();
    }


    private function configureCommands(): void
    {
        DB::prohibitDestructiveCommands($this->app->isProduction());
        DB::enableQueryLog();
    }

    private function configureModels(): void
    {
        Model::shouldBeStrict();
        Model::unguard();
    }
}
