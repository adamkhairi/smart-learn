<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Category;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\CourseMaterial;
use App\Models\Assignment;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\Announcement;
use Illuminate\Support\Facades\Hash;

class LMSSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Users
        $admin = User::create([
            'name' => 'System Admin',
            'email' => 'admin@smartlearn.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_ADMIN,
            'bio' => 'System administrator of SmartLearn LMS',
        ]);

        $teacher1 = User::create([
            'name' => 'Dr. Sarah Johnson',
            'email' => 'sarah.johnson@smartlearn.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_TEACHER,
            'bio' => 'Computer Science Professor with 10+ years of experience',
        ]);

        $teacher2 = User::create([
            'name' => 'Prof. Michael Chen',
            'email' => 'michael.chen@smartlearn.com',
            'password' => Hash::make('password'),
            'role' => User::ROLE_TEACHER,
            'bio' => 'Mathematics Professor specializing in Statistics and Data Science',
        ]);

        $students = [];
        for ($i = 1; $i <= 10; $i++) {
            $students[] = User::create([
                'name' => "Student $i",
                'email' => "student$i@example.com",
                'password' => Hash::make('password'),
                'role' => User::ROLE_STUDENT,
            ]);
        }

        // Create Categories
        $categories = [
            [
                'name' => 'Computer Science',
                'description' => 'Programming, algorithms, and software development courses',
                'slug' => 'computer-science',
                'color' => '#3b82f6',
            ],
            [
                'name' => 'Mathematics',
                'description' => 'Mathematics and statistics courses',
                'slug' => 'mathematics',
                'color' => '#ef4444',
            ],
            [
                'name' => 'Data Science',
                'description' => 'Data analysis, machine learning, and AI courses',
                'slug' => 'data-science',
                'color' => '#10b981',
            ],
            [
                'name' => 'Web Development',
                'description' => 'Frontend and backend web development',
                'slug' => 'web-development',
                'color' => '#f59e0b',
            ],
        ];

        foreach ($categories as $categoryData) {
            Category::create($categoryData);
        }

        // Create Courses
        $courses = [
            [
                'title' => 'Introduction to Laravel',
                'description' => 'Learn the fundamentals of Laravel PHP framework',
                'short_description' => 'Master Laravel from basics to advanced concepts',
                'slug' => 'intro-to-laravel',
                'course_code' => 'CS101',
                'instructor_id' => $teacher1->id,
                'category_id' => 1,
                'status' => Course::STATUS_PUBLISHED,
                'start_date' => now()->subDays(10),
                'end_date' => now()->addDays(60),
                'max_students' => 30,
                'difficulty_level' => 'beginner',
                'is_free' => true,
                'requirements' => ['Basic PHP knowledge', 'Understanding of MVC pattern'],
                'what_you_will_learn' => ['Laravel fundamentals', 'Database migrations', 'Eloquent ORM', 'Authentication'],
            ],
            [
                'title' => 'React for Beginners',
                'description' => 'Learn React.js from scratch',
                'short_description' => 'Build modern web applications with React',
                'slug' => 'react-beginners',
                'course_code' => 'WD201',
                'instructor_id' => $teacher1->id,
                'category_id' => 4,
                'status' => Course::STATUS_PUBLISHED,
                'start_date' => now()->subDays(5),
                'end_date' => now()->addDays(45),
                'max_students' => 25,
                'difficulty_level' => 'beginner',
                'is_free' => true,
                'requirements' => ['HTML/CSS knowledge', 'Basic JavaScript'],
                'what_you_will_learn' => ['React components', 'State management', 'Hooks', 'API integration'],
            ],
            [
                'title' => 'Statistics and Probability',
                'description' => 'Comprehensive course on statistics and probability theory',
                'short_description' => 'Master statistical analysis and probability',
                'slug' => 'statistics-probability',
                'course_code' => 'MATH301',
                'instructor_id' => $teacher2->id,
                'category_id' => 2,
                'status' => Course::STATUS_PUBLISHED,
                'start_date' => now(),
                'end_date' => now()->addDays(90),
                'max_students' => 40,
                'difficulty_level' => 'intermediate',
                'is_free' => false,
                'price' => 99.99,
                'requirements' => ['Basic mathematics', 'Algebra'],
                'what_you_will_learn' => ['Descriptive statistics', 'Probability distributions', 'Hypothesis testing'],
            ],
        ];

        foreach ($courses as $courseData) {
            $course = Course::create($courseData);

            // Create course materials
            CourseMaterial::create([
                'course_id' => $course->id,
                'title' => 'Course Introduction',
                'description' => 'Welcome to the course',
                'type' => 'text',
                'content' => "Welcome to {$course->title}! In this course, you will learn amazing things.",
                'order_index' => 1,
            ]);

            CourseMaterial::create([
                'course_id' => $course->id,
                'title' => 'Getting Started Video',
                'description' => 'Introduction video for the course',
                'type' => 'video',
                'file_url' => 'https://example.com/intro-video.mp4',
                'duration_minutes' => 15,
                'order_index' => 2,
            ]);

            // Create assignments
            Assignment::create([
                'course_id' => $course->id,
                'title' => 'First Assignment',
                'description' => 'Complete the introductory exercises',
                'instructions' => 'Please complete all exercises in the provided worksheet.',
                'type' => 'file_upload',
                'max_points' => 100,
                'due_date' => now()->addDays(14),
                'is_published' => true,
                'allowed_file_types' => ['pdf', 'doc', 'docx'],
            ]);

            // Create quiz
            $quiz = Quiz::create([
                'course_id' => $course->id,
                'title' => 'Course Knowledge Check',
                'description' => 'Test your understanding of the course material',
                'time_limit_minutes' => 30,
                'max_attempts' => 2,
                'is_published' => true,
                'passing_score' => 70,
            ]);

            // Create quiz questions
            QuizQuestion::create([
                'quiz_id' => $quiz->id,
                'question_text' => 'What is the main concept of this course?',
                'question_type' => 'multiple_choice',
                'options' => ['Option A', 'Option B', 'Option C', 'Option D'],
                'correct_answer' => ['Option A'],
                'points' => 10,
                'order_index' => 1,
            ]);

            QuizQuestion::create([
                'quiz_id' => $quiz->id,
                'question_text' => 'True or False: This course is beginner-friendly.',
                'question_type' => 'true_false',
                'options' => ['True', 'False'],
                'correct_answer' => ['True'],
                'points' => 5,
                'order_index' => 2,
            ]);

            // Create announcement
            Announcement::create([
                'course_id' => $course->id,
                'author_id' => $course->instructor_id,
                'title' => 'Welcome to the Course!',
                'content' => "Welcome everyone to {$course->title}! I'm excited to have you all here. Please make sure to check the course materials and complete the first assignment by the due date.",
                'priority' => 'normal',
            ]);

            // Enroll some students
            foreach (array_slice($students, 0, rand(5, 8)) as $student) {
                Enrollment::create([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'status' => Enrollment::STATUS_ACTIVE,
                    'enrolled_at' => now()->subDays(rand(1, 7)),
                    'progress_percentage' => rand(0, 100),
                ]);
            }
        }

        $this->command->info('LMS sample data has been seeded successfully!');
        $this->command->info('Login credentials:');
        $this->command->info('Admin: admin@smartlearn.com / password');
        $this->command->info('Teacher: sarah.johnson@smartlearn.com / password');
        $this->command->info('Student: student1@example.com / password');
    }
}
