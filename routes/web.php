<?php

use App\Http\Controllers\Courses\CourseController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Landing');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('Dashboard/dashboard');
    })->name('dashboard');

    // Course routes
    Route::resource('courses', CourseController::class);
    Route::post('courses/{course}/enroll', [CourseController::class, 'enroll'])->name('courses.enroll');
    Route::delete('courses/{course}/unenroll', [CourseController::class, 'unenroll'])->name('courses.unenroll');
    Route::get('courses/{course}/stats', [CourseController::class, 'stats'])->name('courses.stats');

    // Course Module routes
    Route::resource('courses.modules', App\Http\Controllers\Courses\CourseModuleController::class)
        ->except(['index']);
    Route::get('courses/{course}/modules', [App\Http\Controllers\Courses\CourseModuleController::class, 'index'])
        ->name('courses.modules.index');
    Route::patch('courses/{course}/modules/order', [App\Http\Controllers\Courses\CourseModuleController::class, 'updateOrder'])
        ->name('courses.modules.updateOrder');
    Route::patch('courses/{course}/modules/{module}/toggle-published', [App\Http\Controllers\Courses\CourseModuleController::class, 'togglePublished'])
        ->name('courses.modules.togglePublished');
    Route::post('courses/{course}/modules/{module}/duplicate', [App\Http\Controllers\Courses\CourseModuleController::class, 'duplicate'])
        ->name('courses.modules.duplicate');

    // Course Module Item routes
    Route::resource('courses.modules.items', App\Http\Controllers\Courses\CourseModuleItemController::class)
        ->except(['index']);
    Route::patch('courses/{course}/modules/{module}/items/order', [App\Http\Controllers\Courses\CourseModuleItemController::class, 'updateOrder'])
        ->name('courses.modules.items.updateOrder');
    Route::post('courses/{course}/modules/{module}/items/{item}/duplicate', [App\Http\Controllers\Courses\CourseModuleItemController::class, 'duplicate'])
        ->name('courses.modules.items.duplicate');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
