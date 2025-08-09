import { Head, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Trash2 } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { formatDate } from '@/lib/utils';

interface Course { id: number; name: string }
interface CourseClass { id: number; name: string }
interface ClassSession {
  id: number;
  session_date: string;
  start_time?: string | null;
  end_time?: string | null;
  session_type: 'lecture' | 'lab' | 'exam' | 'discussion';
  topic?: string | null;
  status: 'scheduled' | 'completed' | 'cancelled';
}
interface Paginated<T> { data: T[] }

interface Props { course: Course; classData: CourseClass; sessions: Paginated<ClassSession> }

export default function Index({ course, classData, sessions }: Props) {
  const breadcrumbs = [
    { title: 'Admin', href: '/admin/dashboard' },
    { title: 'Courses', href: '/admin/courses' },
    { title: course.name, href: route('admin.courses.show', course.id) },
    { title: 'Classes', href: route('admin.courses.classes.index', course.id) },
    { title: classData.name, href: '#' },
    { title: 'Sessions', href: '#' },
  ];

  const { data, setData, post, processing, errors } = useForm({
    session_date: '',
    start_time: '',
    end_time: '',
    session_type: 'lecture' as 'lecture' | 'lab' | 'exam' | 'discussion',
    topic: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled',
  });

  const addSession = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('admin.courses.classes.sessions.store', { course: course.id, class: classData.id }), {
      preserveScroll: true,
      onSuccess: () => setData({ session_date: '', start_time: '', end_time: '', session_type: 'lecture', topic: '', status: 'scheduled' }),
    });
  };

  const removeSession = (sessionId: number) => {
    if (!confirm('Delete this session?')) return;
    router.delete(route('admin.courses.classes.sessions.destroy', { course: course.id, class: classData.id, session: sessionId }), {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Class Sessions · ${classData.name}`} />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.get(route('admin.courses.classes.index', course.id))}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Classes
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Class Sessions</h1>
            <p className="text-muted-foreground">Schedule and manage sessions for this class</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Session</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addSession} className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={data.session_date} onChange={(e) => setData('session_date', e.target.value)} />
                {errors.session_date && <p className="text-sm text-red-600">{errors.session_date}</p>}
              </div>
              <div className="space-y-2">
                <Label>Start</Label>
                <Input type="time" value={data.start_time} onChange={(e) => setData('start_time', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End</Label>
                <Input type="time" value={data.end_time} onChange={(e) => setData('end_time', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={data.session_type} onValueChange={(v) => setData('session_type', v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lecture">Lecture</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="discussion">Discussion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Topic</Label>
                <Input value={data.topic} onChange={(e) => setData('topic', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={data.status} onValueChange={(v) => setData('status', v as any)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3">
                <Button type="submit" disabled={processing}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Add Session
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessions.data.length === 0 && <p className="text-muted-foreground">No sessions yet.</p>}
              {sessions.data.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-md border p-3">
                  <div className="space-y-1">
                    <div className="font-medium">{s.topic || 'Untitled Session'}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(s.session_date)}</span>
                      {s.start_time && <span>{s.start_time}</span>}
                      {s.end_time && <span>– {s.end_time}</span>}
                      <span>•</span>
                      <span className="capitalize">{s.session_type}</span>
                      <span>•</span>
                      <span className="uppercase text-xs">{s.status}</span>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => removeSession(s.id)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}


