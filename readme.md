## 📘 Project : Learning Management System ( SmartLearn )

### Project Title

SmartLearn – A Modern E-Learning Platform

### Project Category

Web Application – Full Stack Development (Laravel + React)

### Project Description

SmartLearn is a web-based E-Learning Platform designed to facilitate online education by providing a digital environment for managing courses, assignments, assessments, and collaboration between teachers and students. Inspired by platforms like Google Classroom, SmartLearn aims to streamline the teaching and learning process through intuitive interfaces and robust backend functionality.

The system leverages the Laravel framework for the backend to ensure secure, scalable, and efficient data management, and ReactJS for the frontend to provide a responsive, interactive user experience.

---

## 🚀 Local Development Setup

Follow these steps to get SmartLearn running on your machine.

```bash
# 1. Clone the repository
$ git clone https://github.com/adamkhairi/smart-learn.git
$ cd smart-learn

# 2. Install PHP dependencies
$ composer install --prefer-dist --no-interaction

# 3. Copy environment configuration and generate application key
$ cp .env.example .env
$ php artisan key:generate

# 4. Configure your database credentials in the .env file
#    (SQLite is enabled by default; you can also use MySQL/PostgreSQL)

# 5. Install JavaScript dependencies and build assets
$ npm install
$ npm run build  # or `npm run build` for production

# 6. Run database migrations (and optional seeders)
$ php artisan migrate:fresh --seed

# 7. Start the local development server
$ composer run dev
# or
$ php artisan serve

# 8. Visit the app
Open http://localhost:8000 in your browser.
```

> Tip: Use `php artisan test` to run the PHPUnit/Pest test suites and ensure everything works as expected.

# SmartLearn: Laravel & Inertia.js Implementation Plan

This document outlines the structure and development plan for migrating the SmartLearn platform to a modern stack using Laravel 11, Inertia.js, and React.

---

## 1. Core Architecture & Philosophy

-   **Monolithic Application**: This is a standard web application, not an API-driven SPA. All routes are defined in `routes/web.php` and render server-side-hydrated React components via Inertia.
-   **Convention over Configuration**: We will adhere to Laravel's standard project structure and conventions (Eloquent for ORM, Blade for layouts, Form Requests for validation, etc.) to maximize efficiency.
-   **Feature-Driven Frontend**: The `resources/js` directory will be organized by feature, mirroring the backend domain structure to create a clear mental model for developers.
-   **Thin Controllers, Fat Services**: Controllers will be responsible only for handling HTTP requests and responses. All business logic will be delegated to dedicated Action classes or Model methods.

---

## 2. Global Setup & Tooling

### Backend (`app/`)
-   **Controllers**: Reside in `app/Http/Controllers/Web` and `app/Http/Controllers/Admin`. They use Form Requests for validation and route-model binding extensively.
-   **Models**: Standard Eloquent models in `app/Models`. We will use traits for reusable concerns (e.g., `HasLikes`, `HasBookmarks`).
-   **Actions**: Reusable business logic classes (e.g., `DispatchAutoGrading`, `EnrollUserInCourse`) will live in `app/Actions/{Domain}`. This makes logic portable and easy to test.
-   **Jobs & Events**: Queuable jobs (`app/Jobs`), events (`app/Events`), and listeners (`app/Listeners`) will handle all asynchronous tasks like sending notifications and processing ML jobs.
-   **Policies**: Authorization logic will be encapsulated in `app/Policies` and registered automatically.

### Frontend (`resources/js/`)
-   **Structure**:
    ```text
    resources/js/
    ├── features/         # Components specific to a domain (Course, Assessment)
    ├── shared/           # Components and hooks used across features
    │   ├── ui/           # Generic UI elements (Button, Card, Input)
    │   ├── hooks/
    │   └── types/        # TypeScript types (auto-generated where possible)
    ├── lib/              # Third-party service integrations (axios, pusher)
    ├── layouts/          # Main app layouts (Authenticated, Guest)
    └── main.tsx          # Application entry point
    ```
-   **Tooling**: TypeScript with path aliases (`@/*`), Vite for hot-reloading, `laravel-vite-plugin`, and `vite-tsconfig-paths`.

---

## 3. Feature Implementation Plan

This section breaks down the project feature by feature.

### Phase 1: The Core Foundation

#### A. Authentication & User Profiles
-   **Models**: `User`
-   **Controllers**: Handled by Laravel starter kit (`LoginController`, `RegisterController`, etc.), `Web\ProfileController`
-   **Routes**: `routes/auth.php`, `Route::resource('/profile', ProfileController::class)`
-   **Frontend**: `Pages/Auth/*`, `Pages/Profile/Edit.tsx`

#### B. Course Management
-   **Models**: `Course`, `CourseUser` (pivot)
-   **Controllers**: `Web\CourseController`, `Web\CourseEnrollmentController`
-   **Routes**: Full resource controller for courses (`/courses`), plus custom `enroll` and `unEnroll` actions.
-   **Frontend**: `features/course/components/*`, `Pages/Courses/Index.tsx`, `Pages/Courses/Show.tsx` (Course Dashboard)

#### C. Course Content Structure
-   **Models**: `Module`, `ModuleItem` (contains polymorphic relation to Lecture, Assignment, etc.)
-   **Controllers**: `Web\ModuleController`, `Web\ModuleItemController`
-   **Functionality**: Full CRUD, re-ordering via drag-and-drop.
-   **Frontend**: Components within `features/course/` for displaying the syllabus.

### Phase 2: Learning & Engagement Features

#### A. Lectures & Discussions
-   **Models**: `Lecture`, `LectureComment`, `DiscussionThread`, `DiscussionComment`
-   **Controllers**: `Web\LectureController`, `Web\DiscussionThreadController`, and nested comment controllers.
-   **Functionality**: YouTube integration for lectures, real-time comment updates via Laravel Reverb/Pusher.
-   **Frontend**: `Pages/Lectures/Show.tsx`, `features/discussion/*`

#### B. Announcements & Notifications
-   **Models**: `Announcement`, `Notification`, `PushSubscription`
-   **Controllers**: `Web\AnnouncementController`, `Web\NotificationController`, `Web\PushSubscriptionController`
-   **Jobs**: `SendAnnouncementNotification` job dispatched when an announcement is created.
-   **Frontend**: `features/notifications/NotificationDropdown.tsx`, UI for subscribing to push notifications.

### Phase 3: Assessment & Grading

#### A. Assessments & Assignments
-   **Models**: `Assessment`, `AssessmentQuestion`, `Assignment`, `Submission`, `SubmissionAnswer`
-   **Controllers**: `Web\AssessmentController`, `Web\AssignmentController`, `Web\SubmissionController`
-   **Functionality**: Taking assessments, uploading files for assignments.
-   **Frontend**: `Pages/Assessments/Show.tsx` (taking test), `Pages/Assignments/Show.tsx` (submitting file).

#### B. Grading & Grade Book
-   **Models**: `GradeBook` (summary table)
-   **Controllers**: `Web\GradingController`, `Web\GradeBookController`
-   **Jobs**: `ProcessAutoGrading`, `CheckPlagiarism`, `UpdateGradebookSummary`
-   **Functionality**: Manual grading UI, triggers for ML jobs, student and instructor grade book views.
-   **Frontend**: `Pages/Grading/Edit.tsx`, `Pages/GradeBook/Show.tsx`

### Phase 4: Community & Gamification

#### A. Community Articles
-   **Models**: `Article`, `Comment`, `Like`, `Bookmark`, `Follow` (all with polymorphic relations)
-   **Controllers**: `Web\ArticleController` and separate controllers for each engagement type (`ArticleLikeController`, etc.).
-   **Functionality**: A full-featured blog/forum system.
-   **Frontend**: `Pages/Articles/*` (Index, Show, Create, Edit).

#### B. User-Facing Features
-   **Features**: Achievements, Calendar/Deadlines
-   **Controllers**: `Web\AchievementController`, `Web\CalendarController`
-   **Frontend**: `Pages/Achievements/Index.tsx`, `Pages/Calendar/Index.tsx`

### Phase 5: Administration & Moderation

#### A. Admin Panel
-   **Controllers**: All controllers under `App\Http\Controllers\Admin` namespace.
-   **Routes**: Grouped under an `/admin` prefix with `admin` middleware.
-   **Functionality**: User management, course overview, etc.

#### B. Cheating Detection
-   **Controller**: `Admin\CheatingDetectionController`
-   **Routes**: Admin-only routes to trigger checks and view results.
-   **Jobs**: `RunCheatingDetectionBatch` scheduled job.

---

## 4. Data Model & Relationships

### ERD (Entity Relationship Diagram)
```mermaid
erDiagram
    USER { int id; string name; string email; string role; }
    COURSE { int id; string title; }
    MODULE { int id; string title; int course_id; }
    MODULE_ITEM { int id; int module_id; string itemable_type; int itemable_id; }
    LECTURE { int id; string title; string youtube_id; }
    ASSESSMENT { int id; string title; }
    SUBMISSION { int id; int user_id; int assessment_id; }
    ARTICLE { int id; string title; text body; int user_id; }
    USER ||--o{ COURSE : "teaches"
    USER }o--o{ COURSE : "enrolls"
    COURSE ||--o{ MODULE : "has"
    MODULE ||--o{ MODULE_ITEM : "has"
    MODULE_ITEM o|..|| LECTURE : "is a"
    MODULE_ITEM o|..|| ASSESSMENT : "is a"
    ASSESSMENT ||--o{ SUBMISSION : "receives"
    USER ||--o{ SUBMISSION : "submits"
    USER ||--o{ ARTICLE : "writes"
    ARTICLE ||--o{ "COMMENT" : "has"
    ARTICLE ||--o{ "LIKE" : "has"
```

### Relationship Definitions
-   **User ↔ Course**: A `User` (instructor) can teach many `Courses`. A `User` (student) can enroll in many `Courses`. This is a many-to-many relationship managed by a `course_user` pivot table containing the `role`.
-   **Course ↔ Module**: A `Course` has many `Modules`. A `Module` belongs to one `Course`. (One-to-Many)
-   **Module ↔ ModuleItem**: A `Module` has many `ModuleItems`. (One-to-Many)
-   **ModuleItem ↔ (Lecture, Assessment, Assignment)**: A `ModuleItem` has a polymorphic `itemable` relationship that can point to a `Lecture`, `Assessment`, or `Assignment` model. This avoids cluttering the `module_items` table.
-   **Polymorphic Relations (Likes, Comments, Bookmarks)**: These will be implemented as polymorphic one-to-many relationships. A `Like` model, for example, can belong to an `Article`, a `DiscussionComment`, etc., using `likeable_id` and `likeable_type` columns.
-   **Submission ↔ User/Assessment**: A `Submission` belongs to one `User` and one `Assessment` (or `Assignment`).

---

## 5. Express.js Route Migration Checklist
This table maps every route from the original Express server to its new home in the Laravel application, ensuring 100% feature parity.

| Feature Area | Express Route (`/`) | New Laravel Route (`/`) | Controller@Method |
| :--- | :--- | :--- | :--- |
| **Authentication** | `login`, `logout`, `register`, `forgetpassword`, `recover`, `reset` | Handled by Starter Kit | `Auth\*Controller` |
| **Profile** | `me` (GET, PATCH, DELETE) | `/profile` | `ProfileController@edit, update, destroy` |
| **Courses** | `courses` (CRUD), `end-course` | `/courses` (resource) | `CourseController` |
| **Enrollment** | `enroll`, `un-enroll`, `getEnrollments` | `courses/{c}/enroll` (POST, DELETE), `courses/{c}/participants` | `CourseEnrollmentController`, `CourseParticipantController`|
| **Announcements**| `announcements` (CRUD) | `announcements/{a}` (resource), `courses/{c}/announcements` | `AnnouncementController` |
| **Discussions** | `discussions` (CRUD), `addComment`, `removeComment` | `/discussions/{d}` (resource), `comments/{c}` | `DiscussionThreadController`, `DiscussionCommentController` |
| **Assessments** | `assessments` (CRUD), `auto-grade`, `check-plagiarism` | `/assessments/{a}` (resource) | `AssessmentController` |
| **Submissions** | `submissions` (CRUD), `grade` | `/submissions/{s}` (resource), `submissions/{s}/grade` | `SubmissionController`, `GradingController` |
| **Assignments** | `assignments` (CRUD) | `/assignments/{a}` | `AssignmentController` |
| **Grade Book** | `grade-book`, `grade-book-summary` | `courses/{c}/gradebook` (GET), `.../summary` | `GradeBookController@show, summary`|
| **Deadlines** | `deadlines`, `calendar` | `/calendar` | `CalendarController@index` |
| **Achievements** | `achievements` (GET) | `/me/achievements` | `AchievementController@index`|
| **Notifications**| `notifications` (CRUD), `subscribe`, `push` | `/notifications`, `/push-subscriptions` | `NotificationController`, `PushSubscriptionController`|
| **Articles** | `articles` (CRUD) | `/articles` (resource) | `ArticleController` |
| **Article Likes** | `like`, `unlike` | `/articles/{a}/like` (POST, DELETE) | `ArticleLikeController@store, destroy` |
| **Article BMs** | `bookMarked`, `unBookMarked`, `myBookedMarks` | `/articles/{a}/bookmark`, `/me/bookmarks` | `ArticleBookmarkController` |
| **Article Follows**| `followUser`, `unfollow`, `followers` | `/users/{u}/follow` (POST, DELETE) | `FollowController` |
| **Cheating** | `checkCheating`, `clear`, `getResult` | `/admin/cheating-detection/*` | `Admin\CheatingDetectionController` |


---

## 📈 Future Enhancements

* Video conferencing integration (e.g., Zoom API)
* Mobile responsiveness / PWA
* Analytics dashboard for instructors
* Certificate generation upon course completion
* Gamification features (badges, progress tracking)

Laravel 12.0.0
React 19.0.0
Tailwind CSS 4.0.0
InertiaJS 2.0.0
SQLite (For now)
