<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Assessment;
use App\Models\Bookmark;
use App\Models\Comment;
use App\Models\Course;
use App\Models\Follow;
use App\Models\Like;
use App\Models\Question;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LMSTestSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin already exists (from AdminUserSeeder)
        $admin = User::where('role', 'admin')->first();

        if (!$admin) {
            $admin = User::factory()->create([
                'name' => 'Test Admin User',
                'email' => 'testadmin@lms.com',
                'username' => 'testadmin',
                'role' => 'admin',
            ]);
        }

        $instructors = User::factory(8)->instructor()->create();

        $students = User::factory(20)->student()->create();

        // Create courses with instructors
        $courses = Course::factory(8)
            ->recycle($instructors)
            ->create();

                // Enroll students in courses
        foreach ($courses as $course) {
            $enrolledStudents = $students->random(rand(5, 15));
            foreach ($enrolledStudents as $student) {
                DB::table('course_user_enrollments')->insert([
                    'user_id' => $student->id,
                    'course_id' => $course->id,
                    'enrolled_as' => 'student',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            // Enroll instructors
            DB::table('course_user_enrollments')->insert([
                'user_id' => $course->created_by,
                'course_id' => $course->id,
                'enrolled_as' => 'instructor',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Create articles for knowledge sharing
        $articles = Article::factory(30)
            ->recycle($instructors->concat([$admin]))
            ->create();

        // Create social interactions for articles
        foreach ($articles as $article) {
            // Create likes
            $likers = $students->random(rand(1, 8));
            foreach ($likers as $liker) {
                Like::factory()->create([
                    'user_id' => $liker->id,
                    'likeable_id' => $article->id,
                    'likeable_type' => Article::class,
                ]);
            }

            // Create comments
            $commenters = $students->random(rand(1, 5));
            foreach ($commenters as $commenter) {
                Comment::factory()->create([
                    'user_id' => $commenter->id,
                    'commentable_id' => $article->id,
                    'commentable_type' => Article::class,
                ]);
            }

            // Create bookmarks
            $bookmarkers = $students->random(rand(0, 3));
            foreach ($bookmarkers as $bookmarker) {
                Bookmark::factory()->create([
                    'user_id' => $bookmarker->id,
                    'bookmarkable_id' => $article->id,
                    'bookmarkable_type' => Article::class,
                ]);
            }
        }

        // Create assessments for courses
        foreach ($courses as $course) {
            // Create assignments
            $assignments = Assessment::factory(3)
                ->assignment()
                ->forCourse($course)
                ->create([
                    'created_by' => $course->created_by,
                ]);

            // Create exams
            $exams = Assessment::factory(2)
                ->exam()
                ->forCourse($course)
                ->create([
                    'created_by' => $course->created_by,
                ]);

            // Create questions for assessments
            foreach ($assignments->concat($exams) as $assessment) {
                // Create MCQ questions
                for ($i = 1; $i <= rand(3, 6); $i++) {
                    Question::factory()
                        ->create([
                            'assessment_id' => $assessment->id,
                            'question_number' => $i,
                            'points' => 10,
                            'type' => 'MCQ',
                            'auto_graded' => true,
                            'choices' => [
                                'A' => 'Option A',
                                'B' => 'Option B',
                                'C' => 'Option C',
                                'D' => 'Option D',
                            ],
                            'answer' => 'A',
                        ]);
                }

                // Create Essay questions
                for ($i = 1; $i <= rand(1, 3); $i++) {
                    Question::factory()
                        ->create([
                            'assessment_id' => $assessment->id,
                            'question_number' => $i + 10, // Offset to avoid conflicts
                            'points' => 20,
                            'type' => 'Essay',
                            'auto_graded' => false,
                            'keywords' => ['keyword1', 'keyword2', 'keyword3'],
                        ]);
                }
            }

            // Create submissions for some assessments
            $enrolledStudentIds = DB::table('course_user_enrollments')
                ->where('course_id', $course->id)
                ->where('enrolled_as', 'student')
                ->pluck('user_id');
            $enrolledStudents = User::whereIn('id', $enrolledStudentIds)->get();
            foreach ($assignments->take(2) as $assessment) {
                $maxSubmitters = min(8, $enrolledStudents->count());
                $minSubmitters = min(3, $enrolledStudents->count());
                $submitters = $enrolledStudents->random(rand($minSubmitters, $maxSubmitters));
                foreach ($submitters as $student) {
                    Submission::factory()->create([
                        'course_id' => $course->id,
                        'assessment_id' => $assessment->id,
                        'user_id' => $student->id,
                        'answers' => [
                            '1' => 'Sample answer for question 1',
                            '2' => 'A',
                            '3' => 'Sample essay response',
                        ],
                        'submitted_at' => now()->subDays(rand(1, 10)),
                        'plagiarism_status' => 'none',
                        'auto_grading_status' => 'Graded',
                        'score' => rand(70, 100),
                    ]);
                }
            }
        }

        // Create follow relationships
        foreach ($students->take(10) as $student) {
            $following = $instructors->random(rand(1, 3));
            foreach ($following as $instructor) {
                Follow::factory()->create([
                    'user_id' => $student->id,
                    'follows_id' => $instructor->id,
                ]);
            }
        }

        $this->command->info('LMS test data seeded successfully!');
        $this->command->info("Created: {$students->count()} students, {$instructors->count()} instructors, {$courses->count()} courses");
        $this->command->info("Created: {$articles->count()} articles with social interactions");
        $this->command->info('Created: assessments, questions, submissions, and enrollments');
    }
}
