<?php

namespace App\Actions\Assignment;

use App\Models\Assignment;
use App\Models\Course;
use App\Models\Submission;
use App\Models\UserProgress;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class SubmitAssignmentAction
{
    public function execute(Assignment $assignment, Course $course, array $data = []): array
    {
        DB::beginTransaction();

        try {
            // Check if assignment is open for submissions
            if (!$assignment->canAcceptSubmissions()) {
                throw new Exception('This assignment is not accepting submissions.');
            }

            // Check if user is enrolled in the course
            if (!$course->enrolledUsers()->where('user_id', Auth::id())->exists()) {
                throw new Exception('You must be enrolled in this course to submit assignments.');
            }

            // Check if user already has a submission
            $existingSubmission = Submission::where([
                'user_id' => Auth::id(),
                'course_id' => $course->id,
                'assignment_id' => $assignment->id,
            ])->first();

            if ($existingSubmission && $existingSubmission->finished) {
                throw new Exception('You have already submitted this assignment.');
            }

            $submissionData = [
                'submitted_at' => now(),
                'finished' => true,
                'submission_text' => $data['submission_text'] ?? null,
                'submission_data' => $data['submission_data'] ?? null,
            ];

            // Handle file upload if provided
            if (isset($data['file']) && $data['file'] instanceof UploadedFile) {
                $fileData = $this->handleFileUpload($assignment, $data['file']);
                $submissionData = array_merge($submissionData, $fileData);
            }

            // Handle multiple files if provided
            if (isset($data['files']) && is_array($data['files'])) {
                $filesData = $this->handleMultipleFileUploads($assignment, $data['files']);
                $submissionData['files'] = $filesData;
            }

            // Create or update submission
            $submission = Submission::updateOrCreate(
                [
                    'user_id' => Auth::id(),
                    'course_id' => $course->id,
                    'assignment_id' => $assignment->id,
                ],
                $submissionData
            );

            // Update user progress
            $progress = UserProgress::getOrCreate(
                Auth::id(),
                $course->id,
                null,
                $assignment->moduleItem?->id
            );
            $progress->markAsCompleted();

            // Send notification to instructor if enabled
            if ($assignment->notify_instructor) {
                $this->notifyInstructor($assignment, $submission);
            }

            DB::commit();

            return [
                'submission' => $submission->fresh(),
                'message' => 'Assignment submitted successfully!',
                'success' => true,
            ];
        } catch (Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    private function handleFileUpload(Assignment $assignment, UploadedFile $file): array
    {
        // Validate file size (max 10MB)
        if ($file->getSize() > 10 * 1024 * 1024) {
            throw new Exception('File size cannot exceed 10MB.');
        }

        // Validate file type
        $allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar', 'jpg', 'jpeg', 'png'];
        $extension = strtolower($file->getClientOriginalExtension());
        
        if (!in_array($extension, $allowedExtensions)) {
            throw new Exception('File type not allowed. Allowed types: ' . implode(', ', $allowedExtensions));
        }

        $fileName = Str::uuid() . '.' . $extension;
        $filePath = $file->storeAs(
            'assignments/' . $assignment->id . '/submissions',
            $fileName,
            'private'
        );

        return [
            'file_path' => $filePath,
            'original_filename' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'file_type' => $file->getMimeType(),
        ];
    }

    private function handleMultipleFileUploads(Assignment $assignment, array $files): array
    {
        $uploadedFiles = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $fileData = $this->handleFileUpload($assignment, $file);
                $uploadedFiles[] = $fileData;
            }
        }

        return $uploadedFiles;
    }

    private function notifyInstructor(Assignment $assignment, Submission $submission): void
    {
        // This would typically send an email or create a notification
        // For now, we'll just log it
        \Log::info('Assignment submission notification', [
            'assignment_id' => $assignment->id,
            'submission_id' => $submission->id,
            'student_id' => $submission->user_id,
        ]);
    }
}
