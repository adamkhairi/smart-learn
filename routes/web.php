<?php

use App\Http\Controllers\Courses\CourseController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Course routes
    Route::resource('courses', CourseController::class);
    Route::post('courses/{course}/enroll', [CourseController::class, 'enroll'])->name('courses.enroll');
    Route::delete('courses/{course}/unenroll', [CourseController::class, 'unenroll'])->name('courses.unenroll');
    Route::get('courses/{course}/stats', [CourseController::class, 'stats'])->name('courses.stats');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
