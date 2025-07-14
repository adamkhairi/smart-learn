import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, User, Course, Category, Submission, Assignment, Assessment } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Users, UserCheck, UserX, TrendingUp, BookOpen, Clock, FileText, CheckCircle, Award } from 'lucide-react';

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
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ userStats, courseStats, studentDashboardData }: DashboardProps) {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-muted-foreground">A quick glance at your platform's key metrics.</p>

                {studentDashboardData ? (
                    // Student Dashboard View
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Welcome, {studentDashboardData.user.name}!</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">Here's a summary of your learning journey.</p>
                            </CardContent>
                        </Card>

                        {/* Student Personal Stats */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{studentDashboardData.overall_progress.total_courses_enrolled}</div>
                                    <p className="text-xs text-muted-foreground">Total courses</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Items Completed</CardTitle>
                                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{studentDashboardData.overall_progress.total_completed_items}</div>
                                    <p className="text-xs text-muted-foreground">
                                        Of {studentDashboardData.overall_progress.total_items_in_enrolled_courses} total items
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Assignments Submitted</CardTitle>
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{studentDashboardData.personal_stats.assignments_submitted}</div>
                                    <p className="text-xs text-muted-foreground">Total submissions</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                                    <Award className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{studentDashboardData.overall_progress.average_score.toFixed(1)}%</div>
                                    <p className="text-xs text-muted-foreground">Across all assessments</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Enrolled Courses */}
                        <Card>
                            <CardHeader>
                                <CardTitle>My Enrolled Courses</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {studentDashboardData.enrolled_courses.length > 0 ? (
                                    <div className="space-y-3">
                                        {studentDashboardData.enrolled_courses.map((course) => (
                                            <div key={course.id} className="flex items-center space-x-3 rounded-md border p-3">
                                                <div
                                                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md text-sm font-bold text-white"
                                                    style={{ backgroundColor: course.background_color || '#3B82F6' }}
                                                >
                                                    {getInitials(course.name)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">{course.name}</p>
                                                    <p className="text-xs text-muted-foreground">{course.category?.name || 'Uncategorized'}</p>
                                                </div>
                                                <Link href={`/courses/${course.id}`} className="text-sm font-medium text-primary hover:underline">
                                                    View
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-muted-foreground">Not enrolled in any courses yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Latest Submissions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Latest Submissions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {studentDashboardData.latest_submissions.length > 0 ? (
                                    <div className="space-y-3">
                                        {studentDashboardData.latest_submissions.map((submission) => (
                                            <div key={submission.id} className="flex items-center space-x-3 rounded-md border p-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {submission.assignment?.title || submission.assessment?.title || 'Unknown Item'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">{submission.course?.name || 'N/A'}</p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    {submission.score !== null && (
                                                        <Badge variant="outline">Score: {submission.score}</Badge>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">{formatDate(submission.submitted_at)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-muted-foreground">No submissions yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    // Admin/Instructor Dashboard View (Existing Logic)
                    <>
                        {/* User Statistics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>User Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{userStats?.total_users}</div>
                                            <p className="text-xs text-muted-foreground">All registered users</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{userStats?.active_users}</div>
                                            <p className="text-xs text-muted-foreground">{((userStats?.active_users || 0) / (userStats?.total_users || 1) * 100).toFixed(1)}% of total</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
                                            <UserX className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{userStats?.inactive_users}</div>
                                            <p className="text-xs text-muted-foreground">{((userStats?.inactive_users || 0) / (userStats?.total_users || 1) * 100).toFixed(1)}% of total</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">+12.5%</div>
                                            <p className="text-xs text-muted-foreground">This month</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="grid gap-6 lg:grid-cols-2 mt-6">
                                    {/* Role Distribution */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Role Distribution</CardTitle>
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
                                                    <div className="h-3 w-3 rounded-full bg-gray-500"></div>
                                                    <span className="text-sm font-medium">Students</span>
                                                </div>
                                                <div className="text-sm font-bold">{userStats?.role_distribution.student || 0}</div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Recent Registrations */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Recent Registrations</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {(userStats?.recent_registrations || []).map((user) => (
                                                    <div key={user.id} className="flex items-center space-x-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="text-xs">
                                                                {user.name
                                                                    .split(' ')
                                                                    .map((n) => n[0])
                                                                    .join('')}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium">{user.name}</p>
                                                            <p className="text-xs text-muted-foreground">{user.email}</p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <Badge variant="outline" className="capitalize">{user.role}</Badge>
                                                            <span className="text-xs text-muted-foreground">{formatDate(user.created_at)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Top Instructors */}
                                <Card className="mt-6">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <BookOpen className="h-5 w-5" />
                                            Top Instructors
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {(userStats?.top_instructors || []).map((instructor, index) => (
                                                <div key={instructor.id} className="flex items-center justify-between rounded-lg border p-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                                                            {index + 1}
                                                        </div>
                                                        <Avatar>
                                                            <AvatarFallback>
                                                                {getInitials(instructor.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium">{instructor.name}</div>
                                                            <div className="text-sm text-muted-foreground">{instructor.email}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-2xl font-bold">{instructor.created_courses_count}</div>
                                                        <p className="text-xs text-muted-foreground">Courses Created</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </CardContent>
                        </Card>

                        {/* Course Statistics */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Course Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{courseStats?.total_courses}</div>
                                            <p className="text-xs text-muted-foreground">All courses</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Published Courses</CardTitle>
                                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{courseStats?.published_courses}</div>
                                            <p className="text-xs text-muted-foreground">Currently live</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Draft Courses</CardTitle>
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{courseStats?.draft_courses}</div>
                                            <p className="text-xs text-muted-foreground">In progress</p>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">Archived Courses</CardTitle>
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{courseStats?.archived_courses}</div>
                                            <p className="text-xs text-muted-foreground">No longer active</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="grid gap-6 lg:grid-cols-2 mt-6">
                                    {/* Course Level Distribution */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Course Level Distribution</CardTitle>
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

                                    {/* Latest Courses */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Latest Courses</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {(courseStats?.latest_courses || []).map((course) => (
                                                    <div key={course.id} className="flex items-center space-x-3">
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
                                                        <Badge variant="outline" className="capitalize">{course.status}</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AppLayout>
    );
}
