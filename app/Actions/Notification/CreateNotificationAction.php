<?php

namespace App\Actions\Notification;

use App\Models\User;
use App\Models\Notification;
use App\Notifications\SmartLearnNotification;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class CreateNotificationAction
{
    /**
     * Create a new notification for a user (database only).
     * Uses hybrid approach: stores in custom table and optionally broadcasts.
     */
    public function execute(
        User $user,
        string $title,
        string $message,
        string $type = 'info',
        ?array $data = null,
        ?string $actionUrl = null
    ): Notification {
        try {
            // Store in our custom notifications table
            $notification = Notification::create([
                'user_id' => $user->id,
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $user->id,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'data' => $data,
                'action_url' => $actionUrl,
            ]);

            return $notification;
        } catch (\Exception $e) {
            Log::error('Failed to create notification: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'title' => $title,
                'exception' => $e,
            ]);
            // Re-throw the exception or handle it as appropriate for your application
            // For now, we'll re-throw to ensure the error is propagated
            throw $e;
        }
    }

    /**
     * Send a real-time notification using both database storage and broadcasting.
     */
    public function executeWithBroadcast(
        User $user,
        string $title,
        string $message,
        string $type = 'info',
        ?array $data = null,
        ?string $actionUrl = null
    ): ?Notification {
        try {
            // First store in database using our custom table
            $dbNotification = $this->execute($user, $title, $message, $type, $data, $actionUrl);

            if (!$dbNotification) {
                return null;
            }

            // Then broadcast using Laravel's notification system
            $broadcastNotification = new SmartLearnNotification(
                $title,
                $message,
                $type,
                $actionUrl,
                $data
            );

            // Send via broadcast only (database already handled above)
            $user->notify($broadcastNotification);

            return $dbNotification;
        } catch (\Exception $e) {
            Log::error('Failed to create/broadcast notification: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'title' => $title,
                'exception' => $e,
            ]);
            return null;
        }
    }

    /**
     * Check if broadcasting should be attempted.
     */
    private function shouldBroadcast(): bool
    {
        return config('broadcasting.default') === 'pusher' &&
               config('broadcasting.connections.pusher.key') &&
               config('broadcasting.connections.pusher.secret');
    }

    /**
     * Broadcast the notification to the user's private channel.
     */
    private function broadcastNotification(User $user, Notification $notification): void
    {
        $channelName = 'App.Models.User.' . $user->id;

        $broadcastData = [
            'id' => $notification->id,
            'title' => $notification->title,
            'message' => $notification->message,
            'type' => $notification->type,
            'data' => $notification->data,
            'action_url' => $notification->action_url,
            'created_at' => $notification->created_at->toISOString(),
        ];

        // Use Laravel's broadcasting event system
        event(new \Illuminate\Broadcasting\BroadcastEvent(
            new \Illuminate\Broadcasting\PrivateChannel($channelName),
            'notification',
            $broadcastData
        ));
    }

    /**
     * Create notifications for multiple users.
     */
    public function executeForMultipleUsers(
        array $users,
        string $title,
        string $message,
        string $type = 'info',
        ?array $data = null,
        ?string $actionUrl = null
    ): array {
        $notifications = [];

        foreach ($users as $user) {
            try {
                $notifications[] = $this->execute($user, $title, $message, $type, $data, $actionUrl);
            } catch (\Exception $e) {
                Log::error('Failed to create notification for user ' . $user->id . ': ' . $e->getMessage());
                $notifications[] = null; // Or handle as appropriate
            }
        }

        return array_filter($notifications);
    }

    /**
     * Create a grade notification.
     */
    public function createGradeNotification(
        User $user,
        string $itemTitle,
        float $score,
        ?float $maxScore = null,
        string $itemType = 'assignment',
        ?string $actionUrl = null
    ): Notification {
        $scoreText = $maxScore ? "{$score}/{$maxScore}" : $score;
        $percentage = $maxScore ? round(($score / $maxScore) * 100, 1) : null;
        $percentageText = $percentage ? " ({$percentage}%)" : '';

        return $this->execute(
            user: $user,
            title: ucfirst($itemType) . ' Graded',
            message: "Your {$itemType} \"{$itemTitle}\" has been graded. Score: {$scoreText}{$percentageText}",
            type: 'success',
            data: [
                'item_title' => $itemTitle,
                'item_type' => $itemType,
                'score' => $score,
                'max_score' => $maxScore,
                'percentage' => $percentage,
            ],
            actionUrl: $actionUrl
        );
    }

    /**
     * Create an assignment due reminder notification.
     */
    public function createAssignmentDueReminderNotification(
        User $user,
        string $assignmentTitle,
        \DateTime $dueDate,
        ?string $actionUrl = null
    ): Notification {
        $daysUntilDue = (int) $dueDate->diff(now())->format('%r%a');

        if ($daysUntilDue < 0) {
            $message = "Assignment \"{$assignmentTitle}\" is overdue.";
            $type = 'error';
        } elseif ($daysUntilDue === 0) {
            $message = "Assignment \"{$assignmentTitle}\" is due today!";
            $type = 'warning';
        } elseif ($daysUntilDue === 1) {
            $message = "Assignment \"{$assignmentTitle}\" is due tomorrow.";
            $type = 'warning';
        } else {
            $message = "Assignment \"{$assignmentTitle}\" is due in {$daysUntilDue} days.";
            $type = 'info';
        }

        return $this->execute(
            user: $user,
            title: 'Assignment Due Reminder',
            message: $message,
            type: $type,
            data: [
                'assignment_title' => $assignmentTitle,
                'due_date' => $dueDate->format('Y-m-d H:i:s'),
                'days_until_due' => $daysUntilDue,
            ],
            actionUrl: $actionUrl
        );
    }

    /**
     * Create an enrollment notification.
     */
    public function createEnrollmentNotification(
        User $user,
        string $courseTitle,
        string $status, // 'approved', 'rejected', 'pending'
        ?string $actionUrl = null
    ): ?Notification {
        $titles = [
            'approved' => 'Enrollment Approved',
            'rejected' => 'Enrollment Rejected',
            'pending' => 'Enrollment Request Received',
        ];

        $messages = [
            'approved' => "Your enrollment request for \"{$courseTitle}\" has been approved. You can now access the course content.",
            'rejected' => "Your enrollment request for \"{$courseTitle}\" has been rejected.",
            'pending' => "Your enrollment request for \"{$courseTitle}\" has been received and is pending review.",
        ];

        $types = [
            'approved' => 'success',
            'rejected' => 'error',
            'pending' => 'info',
        ];

        try {
            // Create notification and return the actual object
            $notification = Notification::create([
                'user_id' => $user->id,
                'notifiable_type' => 'App\\Models\\User',
                'notifiable_id' => $user->id,
                'title' => $titles[$status],
                'message' => $messages[$status],
                'type' => $types[$status],
                'data' => [
                    'course_title' => $courseTitle,
                    'enrollment_status' => $status,
                ],
                'action_url' => $actionUrl,
            ]);

            return $notification;
        } catch (\Exception $e) {
            Log::error('Failed to create enrollment notification: ' . $e->getMessage(), [
                'user_id' => $user->id,
                'course_title' => $courseTitle,
                'status' => $status,
                'exception' => $e,
            ]);
            return null;
        }
    }

    /**
     * Create a new course content notification.
     */
    public function createNewContentNotification(
        User $user,
        string $courseTitle,
        string $contentTitle,
        string $contentType, // 'lecture', 'assignment', 'assessment'
        ?string $actionUrl = null
    ): Notification {
        return $this->execute(
            user: $user,
            title: 'New Course Content',
            message: "New {$contentType} \"{$contentTitle}\" has been added to \"{$courseTitle}\".",
            type: 'info',
            data: [
                'course_title' => $courseTitle,
                'content_title' => $contentTitle,
                'content_type' => $contentType,
            ],
            actionUrl: $actionUrl
        );
    }

    /**
     * Create an enrollment request notification for instructors.
     */
    public function createEnrollmentRequestNotification(
        User $user,
        string $studentName,
        string $courseTitle,
        ?string $actionUrl = null
    ): Notification {
        return $this->execute(
            user: $user,
            title: 'New Enrollment Request',
            message: "{$studentName} has requested to enroll in \"{$courseTitle}\". Please review and approve or reject the request.",
            type: 'info',
            data: [
                'student_name' => $studentName,
                'course_title' => $courseTitle,
                'request_type' => 'enrollment_request',
            ],
            actionUrl: $actionUrl
        );
    }

    /**
     * Create a discussion reply notification.
     */
    public function createDiscussionReplyNotification(
        User $user,
        string $discussionTitle,
        string $replierName,
        ?string $actionUrl = null
    ): Notification {
        return $this->execute(
            user: $user,
            title: 'New Discussion Reply',
            message: "{$replierName} replied to the discussion \"{$discussionTitle}\".",
            type: 'info',
            data: [
                'discussion_title' => $discussionTitle,
                'replier_name' => $replierName,
            ],
            actionUrl: $actionUrl
        );
    }
}
