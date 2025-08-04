<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Assignment;
use App\Models\User;
use App\Actions\Notification\CreateNotificationAction;
use Carbon\Carbon;

class SendAssignmentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'assignments:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send reminder notifications for upcoming assignment due dates';

    public function __construct(
        private CreateNotificationAction $createNotificationAction
    ) {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for upcoming assignment due dates...');

        // Get assignments due in the next 3 days
        $upcomingAssignments = Assignment::where('expired_at', '>', now())
            ->where('expired_at', '<=', now()->addDays(3))
            ->where('status', 'open')
            ->with(['course.enrolledUsers'])
            ->get();

        $remindersSent = 0;

        foreach ($upcomingAssignments as $assignment) {
            $dueDate = Carbon::parse($assignment->expired_at);
            $daysUntilDue = (int) $dueDate->diffInDays(now());

            // Only send reminders for 3 days, 1 day, and same day
            if (!in_array($daysUntilDue, [0, 1, 3])) {
                continue;
            }

            // Get enrolled students who haven't submitted yet
            $enrolledStudents = $assignment->course->enrolledUsers()
                ->where('pivot.enrolled_as', 'student')
                ->get();

            foreach ($enrolledStudents as $student) {
                // Check if student has already submitted
                $hasSubmitted = $assignment->submissions()
                    ->where('user_id', $student->id)
                    ->exists();

                if (!$hasSubmitted) {
                    // Find the module item for this assignment
                    $moduleItem = \App\Models\CourseModuleItem::where('itemable_type', 'App\\Models\\Assignment')
                        ->where('itemable_id', $assignment->id)
                        ->first();
                    
                    $actionUrl = null;
                    if ($moduleItem) {
                        $actionUrl = "/courses/{$assignment->course_id}/modules/{$moduleItem->course_module_id}/items/{$moduleItem->id}";
                    }

                    // Check if we've already sent a reminder for this assignment and timeframe
                    $existingNotification = \App\Models\Notification::where('user_id', $student->id)
                        ->where('type', 'warning')
                        ->whereJsonContains('data->assignment_id', $assignment->id)
                        ->whereJsonContains('data->days_until_due', $daysUntilDue)
                        ->where('created_at', '>=', now()->subHours(12)) // Don't send duplicate reminders within 12 hours
                        ->exists();

                    if (!$existingNotification) {
                        $this->createNotificationAction->createAssignmentDueReminderNotification(
                            user: $student,
                            assignmentTitle: $assignment->title,
                            dueDate: $dueDate->toDateTime(),
                            actionUrl: $actionUrl
                        );

                        $remindersSent++;
                    }
                }
            }
        }

        $this->info("Assignment reminders sent: {$remindersSent}");
        $this->info('Assignment reminder check completed.');

        return Command::SUCCESS;
    }
}
