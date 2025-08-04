import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Assignment, Submission, User } from '@/types';
import { useForm } from '@inertiajs/react';
import { AlertCircle, Star } from 'lucide-react';

interface SubmissionWithRelations extends Submission {
    user: User;
    assignment: Assignment;
}

interface GradeSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    submission: SubmissionWithRelations;
}

export default function GradeSubmissionModal({
    isOpen,
    onClose,
    submission,
}: GradeSubmissionModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        score: submission.score?.toString() || '',
        feedback: submission.feedback || '',
        grading_notes: submission.grading_notes || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(`/courses/${submission.course_id}/assignments/${submission.assignment_id}/submissions/${submission.id}/grade`, {
            onSuccess: () => {
                onClose();
                reset();
            },
        });
    };

    const handleClose = () => {
        onClose();
        reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Grade Submission
                    </DialogTitle>
                    <DialogDescription>
                        Grade {submission.user.name}'s submission for "{submission.assignment.title}"
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Student</Label>
                            <p className="font-medium">{submission.user.name}</p>
                            <p className="text-sm text-muted-foreground">{submission.user.email}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Assignment</Label>
                            <p className="font-medium">{submission.assignment.title}</p>
                            <p className="text-sm text-muted-foreground">
                                Total Points: {submission.assignment.total_points || 0}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="score">
                            Score <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <Input
                                id="score"
                                type="number"
                                min="0"
                                max={submission.assignment.total_points || 100}
                                step="0.1"
                                value={data.score}
                                onChange={(e) => setData('score', e.target.value)}
                                placeholder={`Enter score (0-${submission.assignment.total_points || 100})`}
                                className={errors.score ? 'border-red-500' : ''}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                / {submission.assignment.total_points || 100}
                            </div>
                        </div>
                        {errors.score && (
                            <div className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-3 w-3" />
                                {errors.score}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="feedback">Feedback</Label>
                        <Textarea
                            id="feedback"
                            value={data.feedback}
                            onChange={(e) => setData('feedback', e.target.value)}
                            placeholder="Provide feedback to the student..."
                            rows={4}
                            className={`resize-y ${errors.feedback ? 'border-red-500' : ''} text-foreground`}
                        />
                        {errors.feedback && (
                            <div className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-3 w-3" />
                                {errors.feedback}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="grading_notes">Grading Notes (Internal)</Label>
                        <Textarea
                            id="grading_notes"
                            value={data.grading_notes}
                            onChange={(e) => setData('grading_notes', e.target.value)}
                            placeholder="Internal notes for grading (not visible to student)..."
                            rows={3}
                            className={`resize-y ${errors.grading_notes ? 'border-red-500' : ''} text-foreground`}
                        />
                        {errors.grading_notes && (
                            <div className="flex items-center gap-1 text-sm text-red-500">
                                <AlertCircle className="h-3 w-3" />
                                {errors.grading_notes}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Grade'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
