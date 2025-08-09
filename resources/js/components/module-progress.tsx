import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Course, CourseModule, UserEnrollment } from '@/types';
import { BookOpen, CheckCircle, Clock } from 'lucide-react';
import type { ProgressSummary, ModuleProgressSummary } from '@/types/progress';

export interface ModuleProgressProps {
    course: Course;
    modules: CourseModule[];
    userEnrollment?: UserEnrollment;
    // New optional summaries-based props
    courseSummary?: ProgressSummary;
    moduleSummaries?: ModuleProgressSummary[];
    completedItemIds?: number[];
}

export function ModuleProgress({
    userEnrollment,
    modules,
    courseSummary,
    moduleSummaries,
    completedItemIds,
}: ModuleProgressProps) {
    // Prefer new summaries if provided
    const useSummaries = !!courseSummary && Array.isArray(moduleSummaries) && moduleSummaries.length > 0;

    if (useSummaries) {
        const total = courseSummary!.total_items;
        const completed = courseSummary!.completed_items;
        const pct = total > 0 ? (completed / total) * 100 : 0;

        // Build a map for quick module lookup of titles
        const moduleMap = new Map<number, CourseModule>();
        modules.forEach(m => moduleMap.set(m.id, m));

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Course Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                        {completed === total && total > 0 && (
                            <Badge variant="default" className="text-xs">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Completed
                            </Badge>
                        )}
                        <span className="text-sm text-muted-foreground">
                            {completed}/{total}
                        </span>
                    </div>
                </div>

                <Progress value={pct} className="h-2" />

                {/* Per-module breakdown */}
                <div className="mt-2 space-y-2">
                    {moduleSummaries!.map(ms => {
                        const m = moduleMap.get(ms.module_id);
                        const mpct = ms.total_items > 0 ? Math.round((ms.completed_items / ms.total_items) * 100) : 0;
                        return (
                            <div key={ms.module_id} className="rounded-md border p-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="font-medium truncate">{m?.title ?? `Module #${ms.module_id}`}</div>
                                    <div className="text-muted-foreground">{ms.completed_items}/{ms.total_items}</div>
                                </div>
                                <div className="mt-1">
                                    <Progress value={mpct} className="h-1.5" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Legacy fallback based on enrollment.completed_module_items + module items
    const completedModuleItems = userEnrollment?.completed_module_items || completedItemIds || [];
    const totalCourseItems = modules.reduce((sum, module) => sum + ((module as any).module_items?.length || 0), 0);
    const completedCourseItems = modules.reduce((sum, module) => {
        const moduleItemIds = ((module as any).module_items || []).map((item: any) => item.id);
        return sum + completedModuleItems.filter((id: number) => moduleItemIds.includes(id)).length;
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
