import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, PlayCircle, XCircle } from 'lucide-react';
import { ProgressSummary } from '@/types/progress';

interface ProgressCardProps {
    title: string;
    progress: ProgressSummary;
    showTimeSpent?: boolean;
    className?: string;
}

export function ProgressCard({ title, progress, showTimeSpent = true, className = '' }: ProgressCardProps) {
    const formatTimeSpent = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    const getStatusIcon = () => {
        if (progress.completion_percentage === 100) {
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        } else if (progress.in_progress_items > 0) {
            return <PlayCircle className="h-4 w-4 text-blue-600" />;
        } else if (progress.not_started_items === progress.total_items) {
            return <XCircle className="h-4 w-4 text-gray-400" />;
        }
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
    };

    const getStatusText = () => {
        if (progress.completion_percentage === 100) {
            return 'Completed';
        } else if (progress.in_progress_items > 0) {
            return 'In Progress';
        } else if (progress.not_started_items === progress.total_items) {
            return 'Not Started';
        }
        return 'In Progress';
    };

    const getStatusColor = () => {
        if (progress.completion_percentage === 100) {
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        } else if (progress.in_progress_items > 0) {
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        }
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    };

    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        <Badge variant="secondary" className={getStatusColor()}>
                            {getStatusText()}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Progress</span>
                        <span>{progress.completion_percentage}%</span>
                    </div>
                    <Progress value={progress.completion_percentage} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                        <div className="font-semibold text-2xl text-blue-600">
                            {progress.completed_items}
                        </div>
                        <div className="text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-2xl text-orange-600">
                            {progress.in_progress_items}
                        </div>
                        <div className="text-muted-foreground">In Progress</div>
                    </div>
                    <div className="text-center">
                        <div className="font-semibold text-2xl text-gray-600">
                            {progress.not_started_items}
                        </div>
                        <div className="text-muted-foreground">Not Started</div>
                    </div>
                </div>

                {showTimeSpent && progress.total_time_spent > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Total time: {formatTimeSpent(progress.total_time_spent)}</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
