<?php

namespace App\Providers;

use App\Models\Course;
use App\Models\User;
use App\Models\Assignment;
use App\Policies\CoursePolicy;
use App\Policies\UserPolicy;
use App\Policies\AssignmentPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Course::class => CoursePolicy::class,
        User::class => UserPolicy::class,
        Assignment::class => AssignmentPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}
