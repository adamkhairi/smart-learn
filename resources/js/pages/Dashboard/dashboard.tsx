import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Assessment, Assignment, type BreadcrumbItem, Category, Course, Submission, User } from '@/types';
import { Head } from '@inertiajs/react';
import { Award, BookOpen, CheckCircle, Clock, FileText, TrendingUp, UserCheck, Users } from 'lucide-react';

// Import new components
import DashboardStats, { type StatCard } from '@/components/dashboard/DashboardStats';
import EnrolledCourses from '@/components/dashboard/EnrolledCourses';
import RecentSubmissions from '@/components/dashboard/RecentSubmissions';
import Welcome, { type QuickAction, type QuickStat } from '@/components/dashboard/Welcome';

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
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    // Student Dashboard Configuration
    const getStudentStats = (): StatCard[] => {
        if (!studentDashboardData) return [];

        return [
            {
                title: 'Courses Enrolled',
                value: studentDashboardData.overall_progress.total_courses_enrolled,
                description: 'Active enrollments',
                icon: BookOpen,
                iconColor: 'text-blue-500',
            },
            {
                title: 'Items Completed',
                value: studentDashboardData.overall_progress.total_completed_items,
                description: `Of ${studentDashboardData.overall_progress.total_items_in_enrolled_courses} total items`,
                icon: CheckCircle,
                iconColor: 'text-green-500',
            },
            {
                title: 'Assignments Submitted',
                value: studentDashboardData.personal_stats.assignments_submitted,
                description: 'Total submissions',
                icon: FileText,
                iconColor: 'text-purple-500',
            },
            {
                title: 'Average Score',
                value: studentDashboardData.overall_progress.average_score.toFixed(1),
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
        if (!studentDashboardData) return [];

        return [
            {
                label: 'Courses',
                value: studentDashboardData.overall_progress.total_courses_enrolled,
                color: 'blue',
            },
            {
                label: 'Completed',
                value: studentDashboardData.overall_progress.completed_courses,
                color: 'green',
            },
        ];
    };

    // Admin/Instructor Dashboard Configuration
    const getAdminStats = (): StatCard[] => {
        if (!userStats || !courseStats) return [];

        return [
            {
                title: 'Total Users',
                value: userStats.total_users,
                description: 'All registered users',
                icon: Users,
                iconColor: 'text-blue-500',
            },
            {
                title: 'Active Users',
                value: userStats.active_users,
                description: `${((userStats.active_users / userStats.total_users) * 100).toFixed(1)}% of total`,
                icon: UserCheck,
                iconColor: 'text-green-500',
            },
            {
                title: 'Total Courses',
                value: courseStats.total_courses,
                description: 'All courses created',
                icon: BookOpen,
                iconColor: 'text-purple-500',
            },
            {
                title: 'Growth Rate',
                value: '+12.5%',
                description: 'This month',
                icon: TrendingUp,
                iconColor: 'text-orange-500',
                trend: {
                    value: 12.5,
                    label: 'this month',
                    isPositive: true,
                },
            },
        ];
    };

    const getCourseStats = (): StatCard[] => {
        if (!courseStats) return [];

        return [
            {
                title: 'Published Courses',
                value: courseStats.published_courses,
                description: 'Currently live',
                icon: BookOpen,
                iconColor: 'text-green-500',
            },
            {
                title: 'Draft Courses',
                value: courseStats.draft_courses,
                description: 'In progress',
                icon: Clock,
                iconColor: 'text-yellow-500',
            },
            {
                title: 'Archived Courses',
                value: courseStats.archived_courses,
                description: 'No longer active',
                icon: FileText,
                iconColor: 'text-gray-500',
            },
            ...(pendingEnrollmentRequestsCount !== undefined
                ? [
                      {
                          title: 'Pending Requests',
                          value: pendingEnrollmentRequestsCount,
                          description: 'Enrollment requests',
                          icon: Users,
                          iconColor: 'text-red-500',
                          href: '/admin/enrollment-requests',
                      },
                  ]
                : []),
        ];
    };

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
                    <div className="space-y-8">
                        {/* Welcome Section */}
                        <Welcome
                            user={studentDashboardData.user}
                            quickActions={getStudentQuickActions()}
                            quickStats={getStudentQuickStats()}
                            variant="banner"
                        />

                        {/* Student Statistics */}
                        <DashboardStats stats={getStudentStats()} title="Learning Overview" description="Your progress and activity summary" />

                        {/* Main Content Grid */}
                        <div className="grid gap-8 lg:grid-cols-2">
                            {/* Enrolled Courses */}
                            <EnrolledCourses
                                courses={studentDashboardData.enrolled_courses}
                                maxDisplay={5}
                                showProgress={true}
                                showInstructor={true}
                            />

                            {/* Recent Submissions */}
                            <RecentSubmissions
                                submissions={studentDashboardData.latest_submissions}
                                maxDisplay={5}
                                showScore={true}
                                showCourse={true}
                            />
                        </div>
                    </div>
                ) : (
                    // Admin/Instructor Dashboard View
                    <div className="space-y-8">
                        {/* Admin Overview Stats */}
                        <DashboardStats stats={getAdminStats()} title="Platform Overview" description="Key metrics and performance indicators" />

                        {/* Course Statistics */}
                        <DashboardStats
                            stats={getCourseStats()}
                            title="Course Management"
                            description="Course status and enrollment overview"
                            columns={4}
                        />

                        {/* Detailed Analytics */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Role Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                                                <span className="text-sm font-medium">Admins</span>
                                            </div>
                                            <div className="text-sm font-bold">{userStats?.role_distribution.admin || 0}</div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                                                <span className="text-sm font-medium">Instructors</span>
                                            </div>
                                            <div className="text-sm font-bold">{userStats?.role_distribution.instructor || 0}</div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                                                <span className="text-sm font-medium">Students</span>
                                            </div>
                                            <div className="text-sm font-bold">{userStats?.role_distribution.student || 0}</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Course Level Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Course Levels</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {Object.entries(courseStats?.level_distribution || {}).map(([level, count]) => (
                                            <div key={level} className="flex items-center justify-between">
                                                <span className="text-sm font-medium capitalize">{level}</span>
                                                <Badge variant="outline">{count}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid gap-6 lg:grid-cols-2">
                            {/* Recent Registrations */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Registrations</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {(userStats?.recent_registrations || []).map((user) => (
                                            <div key={user.id} className="flex items-center space-x-3 rounded-lg border p-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Badge variant="outline" className="capitalize">
                                                        {user.role}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">{formatDate(user.created_at)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Latest Courses */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Latest Courses</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {(courseStats?.latest_courses || []).map((course) => (
                                            <div key={course.id} className="flex items-center space-x-3 rounded-lg border p-3">
                                                <div
                                                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-sm font-bold text-white"
                                                    style={{ backgroundColor: course.background_color || '#3B82F6' }}
                                                >
                                                    {getInitials(course.name)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{course.name}</p>
                                                    <p className="text-xs text-muted-foreground">{course.category?.name || 'Uncategorized'}</p>
                                                </div>
                                                <Badge variant="outline" className="capitalize">
                                                    {course.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Top Instructors */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="h-5 w-5" />
                                    Top Instructors
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {(userStats?.top_instructors || []).map((instructor, index) => (
                                        <div key={instructor.id} className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="line-clamp-1 font-medium">{instructor.name}</div>
                                                    <div className="line-clamp-1 text-sm text-muted-foreground">{instructor.email}</div>
                                                </div>
                                            </div>
                                            <div className="ml-2 text-right">
                                                <div className="text-xl font-bold">{instructor.created_courses_count}</div>
                                                <p className="text-xs text-muted-foreground">Courses</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
