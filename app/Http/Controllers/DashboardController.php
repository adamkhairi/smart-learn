<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Actions\Dashboard\GetStudentDashboardDataAction;
use App\Actions\Dashboard\GetAdminInstructorDashboardDataAction;

class DashboardController extends Controller
{
    public function index(
        GetStudentDashboardDataAction $getStudentDashboardDataAction,
        GetAdminInstructorDashboardDataAction $getAdminInstructorDashboardDataAction
    )
    {
        $user = Auth::user();

        if ($user && $user->isStudent()) {
            $studentDashboardData = $getStudentDashboardDataAction->execute($user);
            return Inertia::render('Dashboard/dashboard', [
                'studentDashboardData' => $studentDashboardData,
            ]);
        } else {
            $adminInstructorDashboardData = $getAdminInstructorDashboardDataAction->execute($user);
            return Inertia::render('Dashboard/dashboard', $adminInstructorDashboardData);
        }
    }
}
