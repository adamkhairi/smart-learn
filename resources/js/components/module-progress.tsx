import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, BookOpen } from 'lucide-react';
import { CourseModule } from '@/types';

interface ModuleProgressProps {
    module: CourseModule;
    completedItems?: number[];
    totalItems?: number;
    showDetails?: boolean;
}

export function ModuleProgress({
    module,
    completedItems = [],
    totalItems,
    showDetails = false
}: ModuleProgressProps) {
    const itemCount = totalItems || module.itemsCount || module.moduleItems?.length || 0;
    const completedCount = completedItems.length;
    const progressPercentage = itemCount > 0 ? (completedCount / itemCount) * 100 : 0;

    const isCompleted = completedCount === itemCount && itemCount > 0;
    const isInProgress = completedCount > 0 && completedCount < itemCount;
    const isNotStarted = completedCount === 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Progress</span>
                </div>
                <div className="flex items-center gap-2">
                    {isCompleted && (
                        <Badge variant="default" className="text-xs">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Completed
                        </Badge>
                    )}
                    {isInProgress && (
                        <Badge variant="secondary" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            In Progress
                        </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                        {completedCount}/{itemCount}
                    </span>
                </div>
            </div>

            <Progress value={progressPercentage} className="h-2" />

            {showDetails && (
                <div className="text-xs text-muted-foreground">
                    {isCompleted && 'All items completed'}
                    {isInProgress && `${completedCount} of ${itemCount} items completed`}
                    {isNotStarted && itemCount > 0 && 'Not started'}
                    {itemCount === 0 && 'No items in this module'}
                </div>
            )}
        </div>
    );
}
