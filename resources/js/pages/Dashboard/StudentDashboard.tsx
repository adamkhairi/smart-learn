import { Assessment, Assignment, Course, Submission, User } from '@/types';
import { BookOpen, CheckCircle, FileText, Award } from 'lucide-react';

// Import dashboard components
import DashboardStats, { type StatCard } from '@/components/dashboard/DashboardStats';
import EnrolledCourses from '@/components/dashboard/EnrolledCourses';
import RecentSubmissions from '@/components/dashboard/RecentSubmissions';
import Welcome, { type QuickAction, type QuickStat } from '@/components/dashboard/Welcome';

interface StudentDashboardData {
    user: User;
    enrolled_courses: (Course & { creator: User; category: { name: string } })[];
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

interface StudentDashboardProps {
    data: StudentDashboardData;
}

export default function StudentDashboard({ data }: StudentDashboardProps) {
    // Student Dashboard Configuration
    const getStudentStats = (): StatCard[] => {
        return [
            {
                title: 'Courses Enrolled',
                value: data.overall_progress.total_courses_enrolled,
                description: 'Active enrollments',
                icon: BookOpen,
                iconColor: 'text-blue-500',
            },
            {
                title: 'Items Completed',
                value: data.overall_progress.total_completed_items,
                description: `Of ${data.overall_progress.total_items_in_enrolled_courses} total items`,
                icon: CheckCircle,
                iconColor: 'text-green-500',
            },
            {
                title: 'Assignments Submitted',
                value: data.personal_stats.assignments_submitted,
                description: 'Total submissions',
                icon: FileText,
                iconColor: 'text-purple-500',
            },
            {
                title: 'Average Score',
                value: data.overall_progress.average_score.toFixed(1),
                description: 'Across all assessments',
                icon: Award,
                iconColor: 'text-orange-500',
                format: 'percentage',
            },
        ];
    };

    const getStudentQuickActions = (): QuickAction[] => [
        {
            label: 'Browse Courses',
            href: '/courses',
            icon: <BookOpen className="h-4 w-4" />,
        },
        {
            label: 'View Progress',
            href: '/dashboard/progress',
            variant: 'outline',
        },
    ];

    const getStudentQuickStats = (): QuickStat[] => {
        return [
            {
                label: 'Courses',
                value: data.overall_progress.total_courses_enrolled,
                color: 'blue',
            },
            {
                label: 'Completed',
                value: data.overall_progress.completed_courses,
                color: 'green',
            },
        ];
    };

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <Welcome
                user={data.user}
                quickActions={getStudentQuickActions()}
                quickStats={getStudentQuickStats()}
                variant="banner"
            />

            {/* Student Statistics */}
            <DashboardStats
                stats={getStudentStats()}
                title="Learning Overview"
                description="Your progress and activity summary"
            />

            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-2">
                {/* Enrolled Courses */}
                <EnrolledCourses
                    courses={data.enrolled_courses}
                    maxDisplay={5}
                    showProgress={true}
                    showInstructor={true}
                />

                {/* Recent Submissions */}
                <RecentSubmissions
                    submissions={data.latest_submissions}
                    maxDisplay={5}
                    showScore={true}
                    showCourse={true}
                />
            </div>
        </div>
    );
}
