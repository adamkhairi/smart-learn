<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Course;
use App\Models\CourseModule;
use App\Models\CourseModuleItem;
use App\Models\Lecture;
use App\Models\Assessment;
use App\Models\Assignment;
use App\Models\Question;
use App\Models\Submission;
use App\Models\Grade;
use App\Models\Announcement;
use App\Models\Discussion;
use App\Models\DiscussionComment;
use App\Models\UserProgress;
use Illuminate\Support\Facades\Hash;
use Faker\Factory as Faker;
use App\Models\GradesSummary;
use App\Models\Category;

class LMSSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Get existing admin user
        $admin = User::where('email', 'admin@smartlearn.com')->first();

        // Create Instructor Users
        $instructors = [];
        $instructorNames = [
            'Dr. Sarah Johnson' => 'sarah.johnson@smartlearn.com',
            'Prof. Michael Chen' => 'michael.chen@smartlearn.com',
            'Dr. Emily Rodriguez' => 'emily.rodriguez@smartlearn.com',
            'Prof. David Kim' => 'david.kim@smartlearn.com',
            'Dr. Lisa Thompson' => 'lisa.thompson@smartlearn.com',
            'Prof. James Wilson' => 'james.wilson@smartlearn.com',
            'Dr. Maria Garcia' => 'maria.garcia@smartlearn.com',
            'Prof. Robert Brown' => 'robert.brown@smartlearn.com',
        ];

        foreach ($instructorNames as $name => $email) {
            $instructors[] = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'username' => strtolower(str_replace([' ', '.'], ['_', ''], $name)),
            'password' => Hash::make('password'),
                    'role' => 'instructor',
                    'is_active' => true,
                    'is_email_registered' => true,
                ]
            );
        }

        // Create Student Users
        $students = [];
        for ($i = 1; $i <= 50; $i++) {
            $firstName = $faker->firstName();
            $lastName = $faker->lastName();
            $email = strtolower($firstName . '.' . $lastName . $i . '@student.smartlearn.com');

            $students[] = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => "$firstName $lastName",
                    'username' => strtolower($firstName . '_' . $lastName . '_' . $i),
                'password' => Hash::make('password'),
                    'role' => 'student',
                    'is_active' => true,
                    'is_email_registered' => true,
                ]
            );
        }

        // Course categories and topics
        $courseCategories = [
            'Computer Science' => [
                'Programming Fundamentals',
                'Web Development',
                'Mobile Development',
                'Data Structures & Algorithms',
                'Software Engineering',
                'Database Systems',
                'Operating Systems',
                'Computer Networks',
                'Artificial Intelligence',
                'Machine Learning',
                'Cybersecurity',
                'Cloud Computing',
                'DevOps',
                'Game Development',
                'UI/UX Design'
            ],
            'Mathematics' => [
                'Calculus',
                'Linear Algebra',
                'Statistics',
                'Probability Theory',
                'Discrete Mathematics',
                'Number Theory',
                'Differential Equations',
                'Mathematical Analysis'
            ],
            'Business' => [
                'Marketing',
                'Finance',
                'Management',
                'Entrepreneurship',
                'Business Strategy',
                'Project Management',
                'Human Resources',
                'Operations Management'
            ],
            'Language Learning' => [
                'English Grammar',
                'Spanish for Beginners',
                'French Conversation',
                'German Fundamentals',
                'Japanese Basics',
                'Chinese Mandarin',
                'Business English',
                'Academic Writing'
            ],
            'Creative Arts' => [
                'Digital Photography',
                'Graphic Design',
                'Video Editing',
                'Music Production',
                'Creative Writing',
                'Digital Art',
                'Animation',
                'Film Making'
            ]
        ];

        $moduleTitles = [
            'Introduction and Overview',
            'Fundamental Concepts',
            'Core Principles',
            'Advanced Techniques',
            'Practical Applications',
            'Real-world Projects',
            'Best Practices',
            'Final Assessment'
        ];

        $itemTypes = ['lecture', 'assessment', 'assignment'];

        // Create 30 courses
        $categories = collect(); // Initialize a collection to store created categories

        foreach ($courseCategories as $categoryName => $topics) {
            $category = Category::firstOrCreate(
                ['name' => $categoryName],
                ['slug' => \Illuminate\Support\Str::slug($categoryName)]
            );
            $categories->put($categoryName, $category);

            foreach ($topics as $topicName) {
                // Create subcategories or tags if your schema supports it, or simply use topic as course name
                // For now, we'll just ensure the main category is created and use topics for course names
            }
        }

        for ($courseIndex = 1; $courseIndex <= 30; $courseIndex++) {
            // Select random category and topic
            $categoryName = array_rand($courseCategories);
            $topics = $courseCategories[$categoryName];
            $topic = $topics[array_rand($topics)];
            $category = $categories->get($categoryName); // Retrieve the actual Category model

            // Select random instructor
            $instructor = $instructors[array_rand($instructors)];

            $course = Course::create([
                'name' => $topic,
                'description' => $faker->paragraphs(3, true),
                'created_by' => $instructor->id,
                'category_id' => $category->id, // Assign the category_id here
                'background_color' => '#' . str_pad(dechex(mt_rand(0, 0xFFFFFF)), 6, '0', STR_PAD_LEFT),
                'status' => 'published',
                'files' => null,
            ]);

            // Create 8 modules for each course
            for ($moduleIndex = 1; $moduleIndex <= 8; $moduleIndex++) {
                $module = CourseModule::create([
                    'title' => $moduleTitles[$moduleIndex - 1],
                    'description' => $faker->paragraph(),
                'course_id' => $course->id,
                    'order' => $moduleIndex,
                    'is_published' => true,
                ]);

                // Create 3-6 items per module
                $itemCount = rand(3, 6);
                for ($itemIndex = 1; $itemIndex <= $itemCount; $itemIndex++) {
                    $itemType = $itemTypes[array_rand($itemTypes)];

                    switch ($itemType) {
                        case 'lecture':
                            $lecture = Lecture::create([
                                'title' => $faker->sentence(4, 8),
                                'description' => $faker->paragraph(),
                                'content' => $faker->paragraphs(rand(3, 8), true),
                                'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                                'duration' => rand(300, 1800), // 5-30 minutes
                'course_id' => $course->id,
                                'course_module_id' => $module->id,
                                'created_by' => $instructor->id,
                'is_published' => true,
                            ]);

                            CourseModuleItem::create([
                                'title' => $lecture->title,
                                'description' => $lecture->description,
                                'content_json' => ['type' => 'lecture'],
                                'content_html' => $lecture->content,
                                'course_module_id' => $module->id,
                                'itemable_id' => $lecture->id,
                                'itemable_type' => Lecture::class,
                                'order' => $itemIndex,
                                'is_required' => rand(0, 1),
                                'status' => 'published',
                            ]);
                            break;

                        case 'assessment':
                            $assessment = Assessment::create([
                                'type' => $faker->randomElement(['Quiz', 'Exam', 'Project']),
                                'title' => $faker->sentence(4, 6),
                                'max_score' => rand(50, 100),
                                'weight' => rand(1, 5),
                                'questions_type' => 'online',
                                'submission_type' => 'online',
                                'visibility' => 'published',
                'course_id' => $course->id,
                                'created_by' => $instructor->id,
                            ]);

                            CourseModuleItem::create([
                                'title' => $assessment->title,
                                'description' => $assessment->description,
                                'content_json' => ['type' => 'assessment'],
                                'content_html' => $assessment->content,
                                'course_module_id' => $module->id,
                                'itemable_id' => $assessment->id,
                                'itemable_type' => Assessment::class,
                                'order' => $itemIndex,
                                'is_required' => true,
                                'status' => 'published',
                            ]);

                            // Create questions for assessment
                            $questionCount = rand(5, 15);
                            for ($q = 1; $q <= $questionCount; $q++) {
                                $questionType = 'MCQ';
                                $choices = null;
                                $answer = null;

                                if ($questionType === 'MCQ') {
                                    $choices = ['Option A', 'Option B', 'Option C', 'Option D'];
                                    $answer = 'Option A';
                                }

                                Question::create([
                                    'assessment_id' => $assessment->id,
                                    'type' => $questionType,
                                    'question_number' => $q,
                                    'question_text' => $faker->sentence(8, 12) . '?',
                                    'choices' => $choices,
                                    'answer' => $answer,
                                    'points' => rand(5, 20),
                                    'auto_graded' => $questionType === 'MCQ',
                                ]);
                            }
                            break;

                        case 'assignment':
                            $assignment = Assignment::create([
                                'assignment_type' => 'essay',
                                'title' => $faker->sentence(4, 6),
                                'description' => $faker->paragraph(),
                                'total_points' => rand(50, 100),
                                'status' => 'published',
                                'visibility' => true,
                                'started_at' => now()->subDays(rand(1, 7)),
                                'expired_at' => now()->addDays(rand(7, 30)),
                                'course_id' => $course->id,
                                'created_by' => $instructor->id,
                            ]);

                            CourseModuleItem::create([
                                'title' => $assignment->title,
                                'description' => $assignment->description,
                                'content_json' => ['type' => 'assignment'],
                                'content_html' => $assignment->content,
                                'course_module_id' => $module->id,
                                'itemable_id' => $assignment->id,
                                'itemable_type' => Assignment::class,
                                'order' => $itemIndex,
                                'is_required' => true,
                                'status' => 'published',
                            ]);
                            break;
                    }
                }
            }

            // Enroll random students in the course
            $enrolledStudents = array_rand($students, rand(5, 15));
            if (!is_array($enrolledStudents)) {
                $enrolledStudents = [$enrolledStudents];
            }

            foreach ($enrolledStudents as $studentIndex) {
                $student = $students[$studentIndex];

                // Enroll student
                $course->enrolledUsers()->attach($student->id, [
                    'enrolled_as' => 'student',
                    'created_at' => now()->subDays(rand(1, 30))
                ]);

                // Create some progress records
                $progressCount = rand(5, 20);
                for ($p = 1; $p <= $progressCount; $p++) {
                    $module = $course->modules()->inRandomOrder()->first();
                    if ($module) {
                        $item = $module->moduleItems()->inRandomOrder()->first();
                        if ($item) {
                            UserProgress::firstOrCreate(
                                [
                                    'user_id' => $student->id,
                                    'course_module_item_id' => $item->id,
                                ],
                                [
                                    'course_id' => $course->id,
                                    'course_module_id' => $module->id,
                                    'status' => ['not_started', 'in_progress', 'completed'][array_rand([0, 1, 2])],
                                    'time_spent_seconds' => rand(0, 3600),
                                    'completed_at' => rand(0, 1) ? now()->subDays(rand(1, 30)) : null,
                                ]
                            );
                        }
                    }
                }

                // Create some submissions for assessments
                $assessments = $course->assessments()->inRandomOrder()->limit(rand(1, 3))->get();
                foreach ($assessments as $assessment) {
                    if (rand(0, 1)) {
                        $submission = Submission::create([
                            'user_id' => $student->id,
                'course_id' => $course->id,
                            'assessment_id' => $assessment->id,
                            'submitted_at' => now()->subDays(rand(1, 20)),
                            'plagiarism_status' => 'unCalculated',
                            'auto_grading_status' => rand(0, 1) ? 'Graded' : 'unGraded',
                            'finished' => true, // Assuming submissions for assessments are finished
                            'score' => ($assessment->max_score && rand(0,1)) ? rand(0.0, $assessment->max_score) : null,
                        ]);

                        if ($submission->auto_grading_status === 'Graded') {
                            // Use GradesSummary to update/create the aggregated grade record
                            GradesSummary::updateOrCreateGrade(
                                courseId: $course->id,
                                studentId: $student->id,
                                assessmentId: $assessment->id,
                                assessment: $assessment,
                                score: $submission->score ?? rand(60, 100)
                            );
                        }
                    }
                }
            }

            // Create announcements
            $announcementCount = rand(2, 5);
            for ($a = 1; $a <= $announcementCount; $a++) {
                Announcement::create([
                    'course_id' => $course->id,
                    'created_by' => $instructor->id,
                    'title' => $faker->sentence(4, 6),
                    'content' => $faker->paragraphs(rand(1, 3), true),
                    'is_urgent' => rand(0, 1),
                    'is_pinned' => rand(0, 1),
                    'published_at' => now()->subDays(rand(1, 60)),
                ]);
            }

            // Create discussions
            $discussionCount = rand(1, 3);
            for ($d = 1; $d <= $discussionCount; $d++) {
                $discussion = Discussion::create([
                    'course_id' => $course->id,
                    'created_by' => $students[array_rand($students)]->id,
                    'title' => $faker->sentence(4, 8),
                    'content' => $faker->paragraphs(rand(2, 4), true),
                    'created_at' => now()->subDays(rand(1, 45)),
                ]);

                // Create comments for discussion
                $commentCount = rand(2, 8);
                for ($c = 1; $c <= $commentCount; $c++) {
                    DiscussionComment::create([
                        'discussion_id' => $discussion->id,
                        'user_id' => $students[array_rand($students)]->id,
                        'content' => $faker->paragraph(),
                        'created_at' => now()->subDays(rand(1, 30)),
                    ]);
                }
            }
        }

        $this->command->info('LMS comprehensive data has been seeded successfully!');
        $this->command->info('Created:');
        $this->command->info('- 1 Admin user');
        $this->command->info('- 8 Instructor users');
        $this->command->info('- 50 Student users');
        $this->command->info('- 30 Courses with 8 modules each');
        $this->command->info('- Multiple items per module (lectures, assessments, assignments)');
        $this->command->info('- Student enrollments and progress');
        $this->command->info('- Submissions and grades');
        $this->command->info('- Announcements and discussions');
        $this->command->info('');
        $this->command->info('Login credentials:');
        $this->command->info('Admin: admin@smartlearn.com / password');
        $this->command->info('Instructor: sarah.johnson@smartlearn.com / password');
        $this->command->info('Student: student1@student.smartlearn.com / password');
    }
}
