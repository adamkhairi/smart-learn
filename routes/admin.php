<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\CategoryController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    // User management routes
    Route::resource('users', UserController::class);
    Route::patch('users/{user}/toggle-active', [UserController::class, 'toggleActive'])->name('users.toggle-active');
    Route::post('users/{user}/assign-course', [UserController::class, 'assignToCourse'])->name('users.assign-course');
    Route::delete('users/{user}/remove-course', [UserController::class, 'removeFromCourse'])->name('users.remove-course');
    Route::patch('users/{user}/update-course-role', [UserController::class, 'updateCourseRole'])->name('users.update-course-role');
    Route::get('users-stats', [UserController::class, 'stats'])->name('users.stats');

    // Course management routes
    Route::resource('courses', CourseController::class);
    Route::patch('courses/{course}/toggle-status', [CourseController::class, 'toggleStatus'])->name('courses.toggle-status');
    Route::get('courses/{course}/stats', [CourseController::class, 'stats'])->name('courses.stats');
    Route::get('courses/{course}/enrollments', [CourseController::class, 'manageEnrollments'])->name('courses.enrollments');
    Route::post('courses/{course}/enroll-users', [CourseController::class, 'enrollUsers'])->name('courses.enroll-users');
    Route::delete('courses/{course}/unenroll-users', [CourseController::class, 'unenrollUsers'])->name('courses.unenroll-users');
    Route::get('courses/{course}/analytics', [CourseController::class, 'analytics'])->name('courses.analytics');

    // Category management routes
    Route::resource('categories', CategoryController::class)->names('categories');

    // Enrollment Request management routes
    Route::get('enrollment-requests', [App\Http\Controllers\Admin\EnrollmentRequestController::class, 'index'])->name('enrollment-requests.index');
    Route::post('enrollment-requests/{enrollmentRequest}/approve', [App\Http\Controllers\Admin\EnrollmentRequestController::class, 'approve'])->name('enrollment-requests.approve');
    Route::post('enrollment-requests/{enrollmentRequest}/reject', [App\Http\Controllers\Admin\EnrollmentRequestController::class, 'reject'])->name('enrollment-requests.reject');
});
