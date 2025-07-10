import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CourseModule, CourseModuleItem } from '@/types';
import { Link } from '@inertiajs/react';
import { CheckCircle, ChevronLeft, ChevronRight, ClipboardList, Clock, FileText, HelpCircle, Play } from 'lucide-react';

interface ModuleNavigationProps {
    course: { id: number; name: string };
    module: CourseModule;
    currentItem?: CourseModuleItem;
    completedItems?: number[];
}

export function ModuleNavigation({ course, module, currentItem, completedItems = [] }: ModuleNavigationProps) {
    const items = module.moduleItems || [];
    const currentIndex = currentItem ? items.findIndex((item) => item.id === currentItem.id) : -1;
    const previousItem = currentIndex > 0 ? items[currentIndex - 1] : null;
    const nextItem = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

    const progressPercentage = items.length > 0 ? (completedItems.length / items.length) * 100 : 0;

    const getItemIcon = (item: CourseModuleItem) => {
        const iconClass = 'h-4 w-4';
        const itemType =
            item.item_type_name ||
            (item.itemable_type?.includes('Lecture')
                ? 'lecture'
                : item.itemable_type?.includes('Assessment')
                  ? 'assessment'
                  : item.itemable_type?.includes('Assignment')
                    ? 'assignment'
                    : 'unknown');

        switch (itemType) {
            case 'lecture':
                return <Play className={`${iconClass} text-blue-500`} />;
            case 'assessment':
                return <HelpCircle className={`${iconClass} text-orange-500`} />;
            case 'assignment':
                return <ClipboardList className={`${iconClass} text-red-500`} />;
            default:
                return <FileText className={iconClass} />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                    <span>{module.title}</span>
                    <Badge variant="outline" className="text-xs">
                        {completedItems.length}/{items.length}
                    </Badge>
                </CardTitle>
                {items.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Progress</span>
                            <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                    </div>
                )}
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Navigation Buttons */}
                {(previousItem || nextItem) && (
                    <div className="flex justify-between gap-2">
                        {previousItem ? (
                            <Button variant="outline" size="sm" asChild className="flex-1">
                                <Link href={`/courses/${course.id}/modules/${module.id}/items/${previousItem.id}`}>
                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                    Previous
                                </Link>
                            </Button>
                        ) : (
                            <div className="flex-1" />
                        )}

                        {nextItem ? (
                            <Button variant="outline" size="sm" asChild className="flex-1">
                                <Link href={`/courses/${course.id}/modules/${module.id}/items/${nextItem.id}`}>
                                    Next
                                    <ChevronRight className="ml-1 h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <div className="flex-1" />
                        )}
                    </div>
                )}

                {/* Items List */}
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Module Contents</h4>
                    <div className="max-h-64 space-y-1 overflow-y-auto">
                        {items.map((item, index) => {
                            const isCompleted = completedItems.includes(item.id);
                            const isCurrent = currentItem?.id === item.id;

                            return (
                                <Link
                                    key={item.id}
                                    href={`/courses/${course.id}/modules/${module.id}/items/${item.id}`}
                                    className={`flex items-center gap-3 rounded-lg p-2 text-sm transition-colors hover:bg-accent ${
                                        isCurrent ? 'border border-border bg-accent' : ''
                                    }`}
                                >
                                    <div className="flex min-w-0 flex-1 items-center gap-2">
                                        {getItemIcon(item)}
                                        <Badge variant="outline" className="flex-shrink-0 px-1.5 py-0.5 text-xs">
                                            {index + 1}
                                        </Badge>
                                        <span className="flex-1 truncate">{item.title}</span>
                                    </div>

                                    <div className="flex flex-shrink-0 items-center gap-1">
                                        {item.is_required && <div className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                                        {item.duration && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {Math.ceil(item.duration / 60)}m
                                            </div>
                                        )}
                                        {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 border-t pt-4">
                    <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <Link href={`/courses/${course.id}/modules/${module.id}`}>View All Items</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <Link href={`/courses/${course.id}`}>Back to Course</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
