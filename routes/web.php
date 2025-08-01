<?php

use App\Http\Controllers\Courses\CourseController;
use App\Http\Controllers\Courses\CourseModuleController;
use App\Http\Controllers\Courses\CourseModuleItemController;
use App\Http\Controllers\Courses\AssignmentController;
use App\Http\Controllers\AssessmentController;
use App\Http\Controllers\ProgressController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Static pages
// Landing page
Route::get('/', function () {
    return Inertia::render('Landing');
})->name('home');

// About page
Route::get('/about', function () {
    return Inertia::render('About');
})->name('about');

// Contact page
Route::get('/contact', function () {
    return Inertia::render('Contact');
})->name('contact');

// Privacy page
Route::get('/privacy', function () {
    return Inertia::render('Privacy');
})->name('privacy');

// Terms page
Route::get('/terms', function () {
    return Inertia::render('Terms');
})->name('terms');

// Unauthorized page
Route::get('/unauthorized', function () {
    return Inertia::render('Unauthorized');
})->name('unauthorized');

// Public course detail page
Route::get('courses/{course}/public', [CourseController::class, 'publicShow'])->name('courses.public_show');

// Dashboard
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Courses
    Route::resource('courses', CourseController::class);
    Route::post('courses/{course}/enroll', [CourseController::class, 'enroll'])->name('courses.enroll');
    Route::post('courses/{course}/enrollment-request', [CourseController::class, 'enrollmentRequest'])->name('courses.enrollment_request'); // New enrollment request route
    Route::delete('courses/{course}/unenroll', [CourseController::class, 'unenroll'])->name('courses.unenroll');
    Route::get('courses/{course}/stats', [CourseController::class, 'stats'])->name('courses.stats');

    // Course Modules
    Route::patch('courses/{course}/modules/order', [App\Http\Controllers\Courses\CourseModuleController::class, 'updateOrder'])
        ->name('courses.modules.updateOrder');
    Route::patch('courses/{course}/modules/{module}/toggle-published', [App\Http\Controllers\Courses\CourseModuleController::class, 'togglePublished'])
        ->name('courses.modules.togglePublished');
    Route::post('courses/{course}/modules/{module}/duplicate', [App\Http\Controllers\Courses\CourseModuleController::class, 'duplicate'])
        ->name('courses.modules.duplicate');
    Route::resource('courses.modules', CourseModuleController::class)->middleware(['auth']);
    Route::get('courses/{course}/modules', [App\Http\Controllers\Courses\CourseModuleController::class, 'index'])
        ->name('courses.modules.index');

    // Discussions & Comments System

    // Course Discussions
    Route::get('courses/{course}/discussions', [\App\Http\Controllers\Discussions\DiscussionController::class, 'index'])
        ->name('courses.discussions.index');
    Route::post('courses/{course}/discussions', [\App\Http\Controllers\Discussions\DiscussionController::class, 'store'])
        ->name('courses.discussions.store');

    // Individual Course Discussion
    Route::get('courses/{course}/discussions/{discussion}', [\App\Http\Controllers\Discussions\DiscussionController::class, 'show'])
        ->name('courses.discussions.show');

    // Module Discussions
    Route::get('courses/{course}/modules/{module}/discussions', [\App\Http\Controllers\Discussions\DiscussionController::class, 'index'])
        ->name('modules.discussions.index');
    Route::post('courses/{course}/modules/{module}/discussions', [\App\Http\Controllers\Discussions\DiscussionController::class, 'store'])
        ->name('modules.discussions.store');

    // Discussion CRUD (legacy routes - keep for backward compatibility)
    Route::get('discussions/{discussion}', [\App\Http\Controllers\Discussions\DiscussionController::class, 'show'])
        ->name('discussions.show');
    Route::put('discussions/{discussion}', [\App\Http\Controllers\Discussions\DiscussionController::class, 'update'])
        ->name('discussions.update');
    Route::delete('discussions/{discussion}', [\App\Http\Controllers\Discussions\DiscussionController::class, 'destroy'])
        ->name('discussions.destroy');

    // Comments CRUD (real-time)
    Route::post('discussions/{discussion}/comments', [\App\Http\Controllers\Discussions\CommentController::class, 'store'])
        ->name('comments.store');
    Route::put('comments/{comment}', [\App\Http\Controllers\Discussions\CommentController::class, 'update'])
        ->name('comments.update');
    Route::delete('comments/{comment}', [\App\Http\Controllers\Discussions\CommentController::class, 'destroy'])
        ->name('comments.destroy');

    // Comments polling endpoint
    Route::get('discussions/{discussion}/comments', [\App\Http\Controllers\Discussions\CommentController::class, 'getNewComments'])
        ->name('discussions.comments.poll');

    // Course Module Items
    Route::patch('courses/{course}/modules/{module}/items/order', [App\Http\Controllers\Courses\CourseModuleItemController::class, 'updateOrder'])
        ->name('courses.modules.items.updateOrder');
    Route::post('courses/{course}/modules/{module}/items/{item}/duplicate', [App\Http\Controllers\Courses\CourseModuleItemController::class, 'duplicate'])
        ->name('courses.modules.items.duplicate');
    Route::resource('courses.modules.items', CourseModuleItemController::class)->middleware(['auth']);

    // Assignments
    Route::get('courses/{course}/assignments/{assignment}', [AssignmentController::class, 'show'])->name('assignments.show')->middleware('auth');
    Route::get('courses/{course}/assignments/{assignment}/submit', [AssignmentController::class, 'showSubmissionForm'])->name('assignments.submit.form')->middleware('auth');
    Route::post('courses/{course}/assignments/{assignment}/submit', [AssignmentController::class, 'submit'])->middleware('auth');
    Route::get('courses/{course}/assignments/{assignment}/submissions', [AssignmentController::class, 'submissions'])->middleware('auth');
    Route::post('courses/{course}/assignments/{assignment}/submissions/{submission}/grade', [AssignmentController::class, 'gradeSubmission'])->middleware('auth');
    
    // Global Submissions Management
    Route::get('submissions', [AssignmentController::class, 'allSubmissions'])->name('submissions.index')->middleware('auth');

    // Assessments
    Route::get('courses/{course}/assessments/{assessment}/take', [AssessmentController::class, 'take'])->name('assessments.take');
    Route::post('courses/{course}/assessments/{assessment}/submit', [AssessmentController::class, 'submit'])->name('assessments.submit');
    Route::get('courses/{course}/assessments/{assessment}/results', [AssessmentController::class, 'results'])->name('assessments.results');

    // Progress
    Route::get('courses/{course}/progress', [ProgressController::class, 'show'])->name('courses.progress');
    Route::get('progress/overall', [ProgressController::class, 'overall'])->name('progress.overall');
    Route::get('courses/{course}/progress/analytics', [ProgressController::class, 'analytics'])->name('courses.progress.analytics');
    Route::get('progress/{course}', [ProgressController::class, 'show'])->name('progress.show');

    // Progress API
    Route::post('courses/{course}/progress/mark-started', [ProgressController::class, 'markAsStarted'])->name('courses.progress.mark-started');
    Route::post('courses/{course}/progress/mark-completed', [ProgressController::class, 'markAsCompleted'])->name('courses.progress.mark-completed');
    Route::post('courses/{course}/progress/update-time', [ProgressController::class, 'updateTimeSpent'])->name('courses.progress.update-time');

    // Notifications
    Route::get('notifications', [\App\Http\Controllers\NotificationController::class, 'index'])->name('notifications.index');
    Route::get('notifications/recent', [\App\Http\Controllers\NotificationController::class, 'recent'])->name('notifications.recent');
    Route::get('notifications/stats', [\App\Http\Controllers\NotificationController::class, 'stats'])->name('notifications.stats');
    Route::patch('notifications/{notification}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead'])->name('notifications.mark-read');
    Route::patch('notifications/{notification}/unread', [\App\Http\Controllers\NotificationController::class, 'markAsUnread'])->name('notifications.mark-unread');
    Route::patch('notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-read');
    Route::delete('notifications/{notification}', [\App\Http\Controllers\NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::delete('notifications/delete-all-read', [\App\Http\Controllers\NotificationController::class, 'deleteAllRead'])->name('notifications.delete-all-read');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';

// Catch-all route for 404 errors - must be at the end
Route::fallback(function () {
    return Inertia::render('NotFound');
});
