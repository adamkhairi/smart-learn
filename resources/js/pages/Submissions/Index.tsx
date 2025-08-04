import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Assignment, Course, CourseModule, CourseModuleItem, PageProps, Submission, User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    Clock,
    Download,
    Eye,
    FileText,
    Filter,
    GraduationCap,
    Search,
    Star,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';
import GradeSubmissionModal from '@/components/GradeSubmissionModal';

interface SubmissionWithRelations extends Submission {
    user: User;
    assignment: Assignment & {
        moduleItem?: CourseModuleItem & {
            module?: CourseModule;
        };
    };
    course: Course;
}

interface Link {
    url: string | null;
    label: string;
    active: boolean;
}

interface Meta {
    current_page: number;
    from: number;
    last_page: number;
    links: Link[];
    path: string;
    per_page: number;
    to: number;
    total: number;
}

interface SubmissionsIndexPageProps extends PageProps {
    submissions: {
        data: SubmissionWithRelations[];
        links: Link[];
        meta?: Meta;
    };
    courses: Course[];
    selectedCourse?: Course;
    stats: {
        total: number;
        graded: number;
        ungraded: number;
        late: number;
    };
    filters: {
        course_id?: string;
        status?: string;
        search?: string;
    };
}

const breadcrumbs = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'All Submissions',
        href: '#',
    },
];

function Index({ submissions, courses, selectedCourse, stats, filters }: SubmissionsIndexPageProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCourseId, setSelectedCourseId] = useState<string>(filters.course_id || 'all');
    const [selectedStatus, setSelectedStatus] = useState<string>(filters.status || '');
    const [gradeModalOpen, setGradeModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithRelations | null>(null);

    const handleSearch = () => {
        router.get('/submissions', {
            search: searchTerm,
            course_id: selectedCourseId === 'all' ? undefined : selectedCourseId,
            status: selectedStatus,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleCourseChange = (courseId: string) => {
        setSelectedCourseId(courseId);
        router.get('/submissions', {
            search: searchTerm,
            course_id: courseId === 'all' ? undefined : courseId,
            status: selectedStatus,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedStatus('');
        router.get('/submissions', {
            course_id: selectedCourseId === 'all' ? undefined : selectedCourseId,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleGradeSubmission = (submission: SubmissionWithRelations) => {
        setSelectedSubmission(submission);
        setGradeModalOpen(true);
    };

    const handleCloseGradeModal = () => {
        setGradeModalOpen(false);
        setSelectedSubmission(null);
    };

    const getStatusBadge = (submission: SubmissionWithRelations) => {
        const isLate = submission.assignment.expired_at &&
                      new Date(submission.created_at) > new Date(submission.assignment.expired_at);
        const isGraded = submission.score !== null && submission.score !== undefined;

        if (isGraded) {
            return <Badge variant="default" className="bg-green-500">Graded</Badge>;
        }
        if (isLate) {
            return <Badge variant="destructive">Late</Badge>;
        }
        return <Badge variant="secondary">Pending</Badge>;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={selectedCourse ? `${selectedCourse.name} Submissions - SmartLearn` : 'Course Submissions - SmartLearn'} />

            <div className="px-4 py-6">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                                <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">
                                    {selectedCourse ? `${selectedCourse.name} Submissions` : 'Course Submissions'}
                                </h1>
                                <p className="text-muted-foreground">
                                    {selectedCourse
                                        ? `Manage and grade submissions for ${selectedCourse.name}`
                                        : 'Manage and grade submissions for all courses'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Course Selector */}
                        <div className="hidden">
                            <label className="text-sm font-medium mb-2 block">Select Course</label>
                            <Select value={selectedCourseId} onValueChange={handleCourseChange}>
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="All Courses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Courses
                                    </SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id.toString()}>
                                            {course.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Course Selection Section */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Select Course</CardTitle>
                            <CardDescription>Choose a course to view and manage submissions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="w-full">
                                <Select  value={selectedCourseId} onValueChange={handleCourseChange}>
                                    <SelectTrigger className="h-12 text-base">
                                        <SelectValue placeholder="All Courses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Courses</SelectItem>
                                        {courses.map((course) => (
                                            <SelectItem key={course.id} value={course.id.toString()}>
                                                {course.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-blue-100 p-1.5 dark:bg-blue-900">
                                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground sm:text-sm">Total</p>
                                        <p className="text-lg font-bold sm:text-2xl">{stats.total}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-green-100 p-1.5 dark:bg-green-900">
                                        <Star className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground sm:text-sm">Graded</p>
                                        <p className="text-lg font-bold sm:text-2xl">{stats.graded}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-yellow-100 p-1.5 dark:bg-yellow-900">
                                        <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground sm:text-sm">Ungraded</p>
                                        <p className="text-lg font-bold sm:text-2xl">{stats.ungraded}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-red-100 p-1.5 dark:bg-red-900">
                                        <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-medium text-muted-foreground sm:text-sm">Late</p>
                                        <p className="text-lg font-bold sm:text-2xl">{stats.late}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Show content only when course is selected (or all courses selected) */}
                {selectedCourseId ? (
                    <>
                        {/* Filters and Search */}
                        <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filters & Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                            <div className="space-y-2 col-span-3">
                                <label className="text-sm font-medium">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search students, assignments..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-8"
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 col-span-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="graded">Graded</SelectItem>
                                        <SelectItem value="ungraded">Ungraded</SelectItem>
                                        <SelectItem value="late">Late</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-end gap-2">
                                <Button onClick={handleSearch} className="flex-1">
                                    Apply Filters
                                </Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submissions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            {selectedCourse ? `${selectedCourse.name} - Submissions (${stats.total})` : `Submissions (${stats.total})`}
                        </CardTitle>
                        <CardDescription>
                            {selectedCourse
                                ? `Manage and grade assignment submissions for ${selectedCourse.name}`
                                : 'Select a course to manage assignment submissions'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {submissions.data.length > 0 ? (
                            <>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Student</TableHead>
                                                <TableHead>Assignment</TableHead>
                                                <TableHead>Course</TableHead>
                                                <TableHead>Submitted</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Score</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {submissions.data.map((submission) => (
                                                <TableRow key={submission.id}>
                                                    <TableCell>
                                                        <div>
                                                            <Link
                                                                href={`/users/${submission.user.id}`}
                                                                className="font-medium text-indigo-600 hover:underline"
                                                            >
                                                                {submission.user.name}
                                                            </Link>
                                                            <div className="text-sm text-muted-foreground">
                                                                {submission.user.email}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            {submission.assignment.moduleItem ? (
                                                                <Link
                                                                    href={`/courses/${submission.course.id}/modules/${submission.assignment.moduleItem.module?.id}/items/${submission.assignment.moduleItem.id}`}
                                                                    className="font-medium text-indigo-600 hover:underline"
                                                                >
                                                                    {submission.assignment.title}
                                                                </Link>
                                                            ) : (
                                                                <Link
                                                                    href={`/courses/${submission.course.id}/assignments/${submission.assignment.id}`}
                                                                    className="font-medium text-indigo-600 hover:underline"
                                                                >
                                                                    {submission.assignment.title}
                                                                </Link>
                                                            )}
                                                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                Due: {submission.assignment.expired_at
                                                                    ? formatDate(submission.assignment.expired_at)
                                                                    : 'No due date'}
                                                            </div>
                                                            {submission.assignment.moduleItem?.module && (
                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                    Module:
                                                                    <Link
                                                                        href={`/courses/${submission.course.id}/modules/${submission.assignment.moduleItem.module.id}`}
                                                                        className="text-indigo-600 hover:underline ml-1"
                                                                    >
                                                                        {submission.assignment.moduleItem.module.title}
                                                                    </Link>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link
                                                            href={`/courses/${submission.course.id}`}
                                                            className="text-indigo-600 hover:underline"
                                                        >
                                                            {submission.course.name}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-sm">
                                                            {formatDate(submission.created_at)}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(submission)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {submission.score !== null && submission.score !== undefined ? (
                                                            <div className="flex items-center gap-1">
                                                                <Star className="h-3 w-3 text-yellow-500" />
                                                                <span className="font-medium">
                                                                    {submission.score}/{submission.assignment.total_points || 0}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground">Not graded</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {submission.assignment.assignment_type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="outline" size="sm" asChild>
                                                                <Link href={`/courses/${submission.course.id}/assignments/${submission.assignment.id}`}>
                                                                    <Eye className="h-3 w-3 mr-1" />
                                                                    View
                                                                </Link>
                                                            </Button>
                                                            {(submission.score === null || submission.score === undefined) && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleGradeSubmission(submission)}
                                                                >
                                                                    <Star className="h-3 w-3 mr-1" />
                                                                    Grade
                                                                </Button>
                                                            )}
                                                            {submission.files && submission.files.length > 0 && (
                                                                <Button variant="outline" size="sm">
                                                                    <Download className="h-3 w-3 mr-1" />
                                                                    Download
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {submissions.meta && submissions.meta.last_page > 1 && (
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {submissions.meta.from} to {submissions.meta.to} of {submissions.meta.total} submissions
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {submissions.meta.links.map((link, index) => (
                                                <Button
                                                    key={index}
                                                    variant={link.active ? "default" : "outline"}
                                                    size="sm"
                                                    disabled={!link.url}
                                                    onClick={() => link.url && router.visit(link.url)}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                    <FileText className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h3 className="mb-2 text-lg font-medium">No submissions found</h3>
                                <p className="text-muted-foreground">
                                    {Object.values(filters).some(Boolean)
                                        ? "Try adjusting your filters to see more results."
                                        : "No assignment submissions have been made yet."}
                                </p>
                                {Object.values(filters).some(Boolean) && (
                                    <Button variant="outline" onClick={clearFilters} className="mt-4">
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
                    </>
                ) : (
                    /* Empty state when no course is selected */
                    <Card>
                        <CardContent className="p-12">
                            <div className="text-center">
                                <div className="rounded-lg bg-gray-100 p-3 mx-auto w-fit mb-4 dark:bg-gray-800">
                                    <BookOpen className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">Select a Course</h3>
                                <p className="text-muted-foreground mb-4">
                                    Choose a course from the dropdown above to view and manage its assignment submissions.
                                </p>
                                <div className="text-sm text-muted-foreground">
                                    You can manage submissions for courses where you are an instructor or admin.
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Grade Submission Modal */}
            {selectedSubmission && (
                <GradeSubmissionModal
                    isOpen={gradeModalOpen}
                    onClose={handleCloseGradeModal}
                    submission={selectedSubmission}
                />
            )}
        </AppLayout>
    );
}

export default Index;
