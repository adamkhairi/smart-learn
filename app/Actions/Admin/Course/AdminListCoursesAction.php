<?php

namespace App\Actions\Admin\Course;

use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;

class AdminListCoursesAction
{
    public function execute(Request $request): array
    {
        $query = Course::with(['creator', 'enrolledUsers']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('creator', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Filter by status
        if ($request->filled('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }

        // Filter by creator
        if ($request->filled('creator') && $request->get('creator') !== 'all') {
            $query->where('created_by', $request->get('creator'));
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $courses = $query->paginate(15)->withQueryString();

        // Get creators for filter
        $creators = User::whereIn('id', Course::distinct()->pluck('created_by'))->get();

        return [
            'courses' => $courses,
            'creators' => $creators,
            'filters' => $request->only(['search', 'status', 'creator', 'sort_by', 'sort_order']),
        ];
    }
}
