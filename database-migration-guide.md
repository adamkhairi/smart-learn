# Database Migration and Seeding Guide

## Overview
This guide covers the complete database migration and seeding setup for the Laravel LMS system, converted from the original Node.js implementation.

## Models Created (24 Total)

### Core Models
1. **User** - Authentication, roles (admin/instructor/student)
2. **Course** - Course management with enrollment system
3. **Article** - Knowledge sharing with multi-language support
4. **Assessment** - Base assessment functionality
5. **Assignment** - Time-based assignments
6. **Exam** - Timed exams with open/close dates
7. **Question** - MCQ and Essay questions with auto-grading
8. **Submission** - Assignment/exam submissions with plagiarism detection
9. **Grade** - Individual grade records
10. **GradesSummary** - Course-wide grade management

### Interactive Models
11. **Like** - Article likes system
12. **Comment** - Article comments with nested replies
13. **Bookmark** - Article bookmarking
14. **View** - Article view tracking
15. **Follow** - User following relationships

### Course Structure
16. **CourseModule** - Course content organization
17. **CourseModuleItem** - Individual course items
18. **Lecture** - Video lectures with timestamps
19. **LectureComment** - Lecture comments

### Communication
20. **Announcement** - Course announcements
21. **Discussion** - Discussion forums
22. **DiscussionComment** - Discussion replies
23. **Notification** - User notification system
24. **Achievement** - Badge/achievement system

## Migration Files Created

### Core Tables (in dependency order)
1. `2025_06_22_202336_create_users_table.php` - Users with roles and authentication
2. `2025_06_22_202423_create_courses_table.php` - Courses with status and files
3. `2025_06_22_202631_create_articles_table.php` - Articles with language support
4. `2025_06_22_202637_create_course_modules_table.php` - Course modules
5. `2025_06_22_202643_create_course_module_items_table.php` - Module items
6. `2025_06_22_202652_create_lectures_table.php` - Video lectures
7. `2025_06_22_202705_create_assessments_table.php` - Base assessments
8. `2025_06_22_202725_create_exams_table.php` - Timed exams
9. `2025_06_22_202742_create_questions_table.php` - MCQ and Essay questions
10. `2025_06_22_202749_create_submissions_table.php` - Student submissions
11. `2025_06_22_202756_create_grades_summaries_table.php` - Grade summaries
12. `2025_06_22_202756_create_grades_table.php` - Individual grades

### Social Interaction Tables
13. `2025_06_22_202809_create_likes_table.php` - Article likes
14. `2025_06_22_202809_create_comments_table.php` - Article comments
15. `2025_06_22_202809_create_bookmarks_table.php` - Article bookmarks
16. `2025_06_22_202809_create_views_table.php` - Article views
17. `2025_06_22_202821_create_follows_table.php` - User follows

### System Tables
18. `2025_06_22_202821_create_notifications_table.php` - Notifications
19. `2025_06_22_202822_create_achievements_table.php` - Achievements
20. `2025_06_22_203134_create_course_user_enrollments_table.php` - Course enrollments

## Factories Created

### Main Factories
- `UserFactory.php` - Creates users with different roles
- `CourseFactory.php` - Creates courses with realistic data
- `ArticleFactory.php` - Creates articles with multi-language support
- `AssessmentFactory.php` - Creates assignments and exams
- `QuestionFactory.php` - Creates MCQ and Essay questions
- `SubmissionFactory.php` - Creates student submissions
- `LikeFactory.php` - Creates article likes
- `CommentFactory.php` - Creates article comments
- `BookmarkFactory.php` - Creates article bookmarks
- `FollowFactory.php` - Creates user follows

## Seeders Created

### Main Seeders
- `LMSTestSeeder.php` - Comprehensive test data seeder
- `DatabaseSeeder.php` - Main seeder that calls LMSTestSeeder

## Test Data Generated

The `LMSTestSeeder` creates:
- **1 Admin user** (admin@lms.com)
- **5 Instructor users** with instructor role
- **20 Student users** with student role
- **8 Courses** with realistic data
- **Course enrollments** (5-15 students per course)
- **30 Articles** for knowledge sharing
- **Social interactions** (likes, comments, bookmarks)
- **Assessments** (3 assignments + 2 exams per course)
- **Questions** (MCQ and Essay for each assessment)
- **Submissions** for selected assessments
- **Follow relationships** between students and instructors

## Running the Migrations and Seeders

### 1. Run Migrations
```bash
php artisan migrate:fresh
```

### 2. Run Seeders
```bash
php artisan db:seed
```

### 3. Run Specific Seeder
```bash
php artisan db:seed --class=LMSTestSeeder
```

### 4. Fresh Migration with Seeding
```bash
php artisan migrate:fresh --seed
```

## Key Features Implemented

### Database Features
- **Soft Deletes** for data preservation
- **Foreign Key Constraints** for referential integrity
- **Unique Constraints** to prevent duplicates
- **Proper Indexing** for query performance
- **JSON Fields** for flexible data storage

### Model Relationships
- **One-to-Many** (User → Courses, Course → Assessments)
- **Many-to-Many** (Users ↔ Courses via enrollments)
- **Polymorphic** (Questions → Assessments/Assignments)
- **Self-Referencing** (Comments → Parent Comments)

### Business Logic
- **Role-based Access** (Admin, Instructor, Student)
- **Time-based Scheduling** (Exam open/close times)
- **Grade Calculations** (Percentage and letter grades)
- **Auto-grading Support** for MCQ questions
- **Plagiarism Detection** status tracking

## Next Steps

1. **Test the migrations**: Run `php artisan migrate:fresh --seed`
2. **Verify relationships**: Check model relationships work correctly
3. **Add validation**: Implement form request validation
4. **Create controllers**: Build API endpoints for CRUD operations
5. **Add authentication**: Implement Laravel Sanctum for API auth
6. **Write tests**: Create feature and unit tests

## Notes

- All migrations maintain foreign key relationships
- Factories generate realistic test data
- Seeders create a complete test environment
- Soft deletes preserve data integrity
- Proper indexing ensures good performance
- JSON fields allow flexible data storage

The database structure is now ready for the Laravel LMS application with all the functionality from the original Node.js implementation. 
