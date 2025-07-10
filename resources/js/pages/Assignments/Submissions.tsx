import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Assignment, PageProps, Submission } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Download } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';

interface SubmissionsPageProps extends PageProps {
    assignment: Assignment;
    submissions: Submission[];
}

function Submissions({ assignment, submissions }: SubmissionsPageProps) {
    const [isGrading, setIsGrading] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        score: 0,
        feedback: '',
    });

    const handleGradeClick = (submission: Submission) => {
        setSelectedSubmission(submission);
        setData('score', submission.score || 0);
        setData('feedback', submission.feedback || '');
        setIsGrading(true);
    };

    const handleGradeSubmit = () => {
        if (selectedSubmission) {
            post(`/submissions/${selectedSubmission.id}/grade`, {
                onSuccess: () => {
                    setIsGrading(false);
                    reset();
                },
            });
        }
    };

    return (
        <AppLayout>
            <Head title={`Submissions for ${assignment.title}`} />

            <div className="container mx-auto px-4 py-6">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/courses/${assignment.course_id}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Course
                            </Link>
                        </Button>
                        <h1 className="mt-2 text-2xl font-bold">Submissions for "{assignment.title}"</h1>
                    </div>
                    <Badge>{submissions.length} Submissions</Badge>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Student Submissions</CardTitle>
                        <CardDescription>Review and grade the submissions for this assignment.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Submitted At</TableHead>
                                    <TableHead>File</TableHead>
                                    <TableHead>Grade</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((submission) => (
                                    <TableRow key={submission.id}>
                                        <TableCell>{submission.user?.name || 'Unknown User'}</TableCell>
                                        <TableCell>{new Date(submission.submitted_at).toLocaleString()}</TableCell>
                                        <TableCell>
                                            {submission.files && submission.files.length > 0 ? (
                                                submission.files.map((file, index) => (
                                                    <a key={index} href={`/storage/${file}`} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="outline" size="sm" className="mr-1">
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Download {index + 1}
                                                        </Button>
                                                    </a>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground">No files</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {submission.score !== null && submission.score !== undefined ? (
                                                <Badge>{submission.score}</Badge>
                                            ) : (
                                                <Badge variant="secondary">Not Graded</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Button size="sm" onClick={() => handleGradeClick(submission)}>
                                                Grade
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={isGrading} onOpenChange={setIsGrading}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Grade Submission</DialogTitle>
                            <DialogDescription>Grade the submission for {selectedSubmission?.user?.name}.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="score">Score</Label>
                                <Input
                                    id="score"
                                    type="number"
                                    value={data.score}
                                    onChange={(e) => setData('score', parseInt(e.target.value, 10))}
                                    className={errors.score ? 'border-destructive' : ''}
                                />
                                <InputError message={errors.score} />
                            </div>
                            <div>
                                <Label htmlFor="feedback">Feedback</Label>
                                <Textarea
                                    id="feedback"
                                    value={data.feedback}
                                    onChange={(e) => setData('feedback', e.target.value)}
                                    className={errors.feedback ? 'border-destructive' : ''}
                                />
                                <InputError message={errors.feedback} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsGrading(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleGradeSubmit} disabled={processing}>
                                {processing ? 'Submitting...' : 'Submit Grade'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}

export default Submissions;
