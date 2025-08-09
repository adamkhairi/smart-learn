<?php

namespace App\Actions\Progress;

use App\Models\Course;
use App\Models\UserProgress;
use App\Models\CourseModuleItem;
use Illuminate\Support\Facades\DB;

class GetCourseProgressAnalyticsAction
{
    public function execute(Course $course): array
    {
        $students = $course->getStudents();
        $studentIds = $students->pluck('id');

        // Total items for the course (once)
        $moduleIds = $course->modules()->pluck('id');
        $totalItems = CourseModuleItem::whereIn('course_module_id', $moduleIds)->count();

        // Aggregate per-student status counts (one query)
        $rows = UserProgress::select('user_id', 'status', DB::raw('COUNT(*) as cnt'), DB::raw('SUM(time_spent_seconds) as t'))
            ->where('course_id', $course->id)
            ->whereIn('user_id', $studentIds)
            ->groupBy('user_id', 'status')
            ->get();

        $byUser = [];
        foreach ($rows as $r) {
            $u = (int) $r->user_id;
            if (!isset($byUser[$u])) {
                $byUser[$u] = [
                    'completed' => 0,
                    'in_progress' => 0,
                    'time' => 0,
                ];
            }
            if ($r->status === 'completed') {
                $byUser[$u]['completed'] += (int) $r->cnt;
            } elseif ($r->status === 'in_progress') {
                $byUser[$u]['in_progress'] += (int) $r->cnt;
            }
            $byUser[$u]['time'] += (int) $r->t;
        }

        $studentProgress = [];
        foreach ($students as $student) {
            $u = $student->id;
            $completed = $byUser[$u]['completed'] ?? 0;
            $inProgress = $byUser[$u]['in_progress'] ?? 0;
            $notStarted = max(0, $totalItems - $completed - $inProgress);
            $totalTime = $byUser[$u]['time'] ?? 0;

            $progress = [
                'total_items' => $totalItems,
                'completed_items' => $completed,
                'in_progress_items' => $inProgress,
                'not_started_items' => $notStarted,
                'completion_percentage' => $totalItems > 0 ? round(($completed / $totalItems) * 100, 2) : 0,
                'total_time_spent' => $totalTime,
            ];

            $studentProgress[] = [
                'student' => $student,
                'progress' => $progress,
            ];
        }

        return [
            'course' => $course,
            'studentProgress' => $studentProgress,
        ];
    }
}
