<?php

use App\Http\Controllers\Courses\CourseController;
use App\Http\Controllers\Courses\CourseModuleController;
use App\Http\Controllers\Courses\CourseModuleItemController;
use App\Http\Controllers\Courses\AssignmentController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\ProgressController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Landing');
})->name('home');

// Static pages
Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

Route::get('/contact', function () {
    return Inertia::render('Contact');
})->name('contact');

Route::get('/privacy', function () {
    return Inertia::render('Privacy');
})->name('privacy');

Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

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
    Route::resource('courses.modules', CourseModuleController::class)->middleware(['auth']);
    Route::get('courses/{course}/modules', [App\Http\Controllers\Courses\CourseModuleController::class, 'index'])
        ->name('courses.modules.index');
    Route::patch('courses/{course}/modules/order', [App\Http\Controllers\Courses\CourseModuleController::class, 'updateOrder'])
        ->name('courses.modules.updateOrder');
    Route::patch('courses/{course}/modules/{module}/toggle-published', [App\Http\Controllers\Courses\CourseModuleController::class, 'togglePublished'])
        ->name('courses.modules.togglePublished');
    Route::post('courses/{course}/modules/{module}/duplicate', [App\Http\Controllers\Courses\CourseModuleController::class, 'duplicate'])
        ->name('courses.modules.duplicate');

    // Course Module Item routes
    Route::resource('courses.modules.items', CourseModuleItemController::class)->middleware(['auth']);
    Route::patch('courses/{course}/modules/{module}/items/order', [App\Http\Controllers\Courses\CourseModuleItemController::class, 'updateOrder'])
        ->name('courses.modules.items.updateOrder');
    Route::post('courses/{course}/modules/{module}/items/{item}/duplicate', [App\Http\Controllers\Courses\CourseModuleItemController::class, 'duplicate'])
        ->name('courses.modules.items.duplicate');

    // Assignment routes
    Route::post('assignments/{assignment}/submit', [AssignmentController::class, 'submit'])->middleware('auth');
    Route::get('assignments/{assignment}/submissions', [AssignmentController::class, 'submissions'])->middleware('auth');
    Route::post('submissions/{submission}/grade', [AssignmentController::class, 'grade'])->middleware('auth');

    // Assessment routes
    Route::get('courses/{course}/assessments/{assessment}/take', [AssessmentController::class, 'take'])->name('assessments.take');
    Route::post('courses/{course}/assessments/{assessment}/submit', [AssessmentController::class, 'submit'])->name('assessments.submit');
    Route::get('courses/{course}/assessments/{assessment}/results', [AssessmentController::class, 'results'])->name('assessments.results');

    // Progress routes
    Route::get('courses/{course}/progress', [ProgressController::class, 'show'])->name('courses.progress');
    Route::get('progress/overall', [ProgressController::class, 'overall'])->name('progress.overall');
    Route::get('courses/{course}/progress/analytics', [ProgressController::class, 'analytics'])->name('courses.progress.analytics');
    Route::get('progress/{course}', [ProgressController::class, 'show'])->name('progress.show');

    // Progress API routes
    Route::post('courses/{course}/progress/mark-started', [ProgressController::class, 'markAsStarted'])->name('courses.progress.mark-started');
    Route::post('courses/{course}/progress/mark-completed', [ProgressController::class, 'markAsCompleted'])->name('courses.progress.mark-completed');
    Route::post('courses/{course}/progress/update-time', [ProgressController::class, 'updateTimeSpent'])->name('courses.progress.update-time');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';

// Catch-all route for 404 errors - must be at the end
Route::fallback(function () {
    return Inertia::render('NotFound');
});
