import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Head, Link } from '@inertiajs/react';
import { BreadcrumbItem } from '@/types';
import type { ProgressSummary } from '@/types/progress';
import { BarChart3, BookOpen, Clock } from 'lucide-react';

interface OverallCourseRow {
  course: {
    id: number;
    name: string;
    image?: string | null;
  };
  progress: ProgressSummary & { total_time_spent?: number };
}

interface OverallPageProps {
  courses: { id: number; name: string }[];
  overallProgress: OverallCourseRow[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Progress', href: '/progress/overall' },
  { title: 'Overall', href: '#' },
];

export default function Overall({ overallProgress }: OverallPageProps) {
  const totalCourses = overallProgress.length;

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Overall Progress" />
      <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 lg:gap-6 lg:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold">Overall Progress</h1>
          </div>
          <Badge variant="secondary">{totalCourses} courses</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead className="min-w-[220px]">Completion</TableHead>
                    <TableHead className="w-40 text-right">Completed</TableHead>
                    <TableHead className="w-40 text-right">Time Spent</TableHead>
                    <TableHead className="w-24 text-right"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overallProgress.map((row) => {
                    const p = row.progress;
                    const pct = p.total_items > 0 ? Math.round((p.completed_items / p.total_items) * 100) : 0;
                    const timeHrs = Math.floor((p.total_time_spent || 0) / 3600);
                    const timeMin = Math.floor(((p.total_time_spent || 0) % 3600) / 60);
                    return (
                      <TableRow key={row.course.id}>
                        <TableCell className="align-middle">
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{row.course.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Progress value={pct} className="h-2 w-48" />
                            <span className="text-sm text-muted-foreground">{pct}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{p.completed_items}/{p.total_items}</TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {timeHrs}h {timeMin}m
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={route('courses.show', { course: row.course.id })} className="text-sm text-primary hover:underline">
                            View
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {overallProgress.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                        No enrolled courses.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
