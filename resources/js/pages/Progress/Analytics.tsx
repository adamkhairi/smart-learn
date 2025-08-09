import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Head, Link } from '@inertiajs/react';
import { BreadcrumbItem, Course } from '@/types';
import type { ProgressSummary } from '@/types/progress';
import { BarChart3, Clock, User } from 'lucide-react';

interface AnalyticsPageProps {
  course: Course;
  studentProgress: { student: any; progress: ProgressSummary & { total_time_spent?: number } }[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Courses', href: '/courses' },
  { title: 'Analytics', href: '#' },
];

export default function Analytics({ course, studentProgress }: AnalyticsPageProps) {
  const totalStudents = studentProgress.length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Analytics • ${course.name}`} />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Course Analytics</h1>
          </div>
          <Badge variant="secondary">{course.name}</Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Students Progress</span>
                <span className="text-sm font-normal text-muted-foreground">{totalStudents} students</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-64">Student</TableHead>
                      <TableHead className="min-w-[200px]">Completion</TableHead>
                      <TableHead className="w-32 text-right">Completed</TableHead>
                      <TableHead className="w-32 text-right">In Progress</TableHead>
                      <TableHead className="w-40 text-right">Time Spent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentProgress.map((row) => {
                      const p = row.progress;
                      const pct = p.total_items > 0 ? Math.round((p.completed_items / p.total_items) * 100) : 0;
                      const timeHrs = Math.floor((p.total_time_spent || 0) / 3600);
                      const timeMin = Math.floor(((p.total_time_spent || 0) % 3600) / 60);
                      return (
                        <TableRow key={row.student.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{row.student.name}</div>
                                <div className="text-xs text-muted-foreground">{row.student.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Progress value={pct} className="h-2 w-40" />
                              <span className="text-sm text-muted-foreground">{pct}%</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{p.completed_items}/{p.total_items}</TableCell>
                          <TableCell className="text-right">{p.in_progress_items}</TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              {timeHrs}h {timeMin}m
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {studentProgress.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                          No enrolled students.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Link href={route('courses.show', { course: course.id })} className="text-sm text-muted-foreground hover:underline">
            Back to course
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
