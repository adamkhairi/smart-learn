## 📘 Project : Learning Management System ( SmartLearn )

### Project Title

SmartLearn – A Modern Learning Management System

### Project Category

Web Application – Full Stack Development (Laravel + React)

### Project Description

SmartLearn is a web-based Learning Management System (LMS) designed to facilitate online education by providing a digital environment for managing courses, assignments, assessments, and collaboration between teachers and students. Inspired by platforms like Google Classroom, SmartLearn aims to streamline the teaching and learning process through intuitive interfaces and robust backend functionality.

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

## 🧩 Project Objectives

1. Enable instructors to create, manage, and publish online courses.
2. Allow students to enroll in courses, access materials, and submit assignments.
3. Provide tools for communication such as announcements and comments.
4. Implement role-based access (admin, teacher, student).
5. Support assignment creation, submission tracking, and grading.
6. Deliver real-time notifications and updates.
7. Ensure secure authentication and user data protection.

---

## ⚙️ Key Features

### 👩‍🏫 For Instructors

* Course creation and content upload (videos, PDFs, links, etc.)
* Assignment and quiz management
* Student management (view, enroll, remove)
* Grading and feedback system
* Announcements and course updates

### 👨‍🎓 For Students

* View enrolled courses and materials
* Submit assignments and take quizzes
* Receive grades and feedback
* View announcements and notifications
* Interact via comments or messages

### 🛠 For Admin

* Manage all users (instructors, students)
* Monitor course statistics
* Moderate platform activity
* System configuration (e.g., categories, subjects)

---

## 🧱 Technologies Used

| Layer     | Technology                                |
| --------- | ----------------------------------------- |
| Frontend  | ReactJS, Tailwind CSS (or Bootstrap)      |
| Backend   | Laravel, Laravel Sanctum (for API auth)   |
| Database  | MySQL or PostgreSQL                       |
| API       | RESTful APIs (Laravel API Resources)      |
| Dev Tools | VS Code, Postman, Git, Figma (for UI)     |
| Hosting   | (Optional) Laravel Forge + Vercel/Netlify |

---

## 🔐 Security Considerations

* Role-based access control
* CSRF and XSS protection
* Authentication using Laravel Sanctum
* Input validation and error handling
* Secure file uploads and storage

---

## 🧪 Testing & Evaluation

* Unit testing (Laravel)
* API testing (Postman)
* User Acceptance Testing (UAT)
* Performance/load testing

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
