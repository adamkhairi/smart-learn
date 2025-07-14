import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Course, CourseModule, UserEnrollment } from '@/types';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';

export interface ModuleProgressProps {
    course: Course;
    userEnrollment?: UserEnrollment;
    modules: CourseModule[];
}

export function ModuleProgress({
    userEnrollment,
    modules,
}: ModuleProgressProps) {
    const completedModuleItems = userEnrollment?.completed_module_items || [];

    const totalCourseItems = modules.reduce((sum, module) => sum + (module.module_items?.length || 0), 0);
    const completedCourseItems = modules.reduce((sum, module) => {
        const moduleItemIds = (module.module_items || []).map(item => item.id);
        return sum + completedModuleItems.filter(id => moduleItemIds.includes(id)).length;
    }, 0);

    const progressPercentage = totalCourseItems > 0 ? (completedCourseItems / totalCourseItems) * 100 : 0;

    const isCompleted = completedCourseItems === totalCourseItems && totalCourseItems > 0;
    const isInProgress = completedCourseItems > 0 && completedCourseItems < totalCourseItems;
    const isNotStarted = completedCourseItems === 0;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Course Progress</span>
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
                        {completedCourseItems}/{totalCourseItems}
                    </span>
                </div>
            </div>

            <Progress value={progressPercentage} className="h-2" />

            <div className="text-xs text-muted-foreground">
                {isCompleted && 'All course items completed'}
                {isInProgress && `${completedCourseItems} of ${totalCourseItems} items completed`}
                {isNotStarted && totalCourseItems > 0 && 'Not started'}
                {totalCourseItems === 0 && 'No items in this course yet'}
            </div>
        </div>
    );
}
