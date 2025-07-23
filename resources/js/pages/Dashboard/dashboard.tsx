import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, User, Course, Category, Assessment, Assignment, Submission } from '@/types';
import { Head } from '@inertiajs/react';

// Import dashboard components
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';

interface StatsUser extends User {
    created_courses_count: number;
}

interface RoleDistribution {
    admin: number;
    instructor: number;
    student: number;
}

interface UserStats {
    total_users: number;
    active_users: number;
    inactive_users: number;
    role_distribution: RoleDistribution;
    recent_registrations: StatsUser[];
    top_instructors: StatsUser[];
}

interface CourseLevelDistribution {
    [key: string]: number;
}

interface CourseStats {
    total_courses: number;
    published_courses: number;
    draft_courses: number;
    archived_courses: number;
    level_distribution: CourseLevelDistribution;
    latest_courses: Course[];
}

interface StudentDashboardData {
    user: User;
    enrolled_courses: (Course & { creator: User; category: Category })[];
    latest_submissions: (Submission & { assignment?: Assignment; assessment?: Assessment; course: Course })[];
    overall_progress: {
        total_courses_enrolled: number;
        completed_courses: number;
        total_completed_items: number;
        total_items_in_enrolled_courses: number;
        average_score: number;
    };
    personal_stats: {
        courses_created: number;
        courses_enrolled: number;
        courses_teaching: number;
        assignments_submitted: number;
        articles_published: number;
        followers_count: number;
        following_count: number;
    };
}

interface DashboardProps {
    userStats?: UserStats;
    courseStats?: CourseStats;
    studentDashboardData?: StudentDashboardData;
    pendingEnrollmentRequestsCount?: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ userStats, courseStats, studentDashboardData, pendingEnrollmentRequestsCount }: DashboardProps) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                        <p className="text-muted-foreground">
                            {studentDashboardData
                                ? 'Track your learning progress and explore new courses'
                                : 'Monitor platform performance and manage content'}
                        </p>
                    </div>
                </div>

                {studentDashboardData ? (
                    // Student Dashboard View
                    <StudentDashboard data={studentDashboardData} />
                ) : (
                    // Admin/Instructor Dashboard View
                    <AdminDashboard
                        userStats={userStats!}
                        courseStats={courseStats!}
                        pendingEnrollmentRequestsCount={pendingEnrollmentRequestsCount}
                    />
                )}
            </div>
        </AppLayout>
    );
}
