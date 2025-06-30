import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CourseModule, CourseModuleItem } from '@/types';
import {
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    Clock,
    Play,
    FileText,
    Link as LinkIcon,
    HelpCircle,
    ClipboardList
} from 'lucide-react';
import { Link } from '@inertiajs/react';

interface ModuleNavigationProps {
    course: { id: number; name: string };
    module: CourseModule;
    currentItem?: CourseModuleItem;
    completedItems?: number[];
}

export function ModuleNavigation({
    course,
    module,
    currentItem,
    completedItems = []
}: ModuleNavigationProps) {
    const items = module.moduleItems || [];
    const currentIndex = currentItem ? items.findIndex(item => item.id === currentItem.id) : -1;
    const previousItem = currentIndex > 0 ? items[currentIndex - 1] : null;
    const nextItem = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

    const progressPercentage = items.length > 0 ? (completedItems.length / items.length) * 100 : 0;

    const getItemIcon = (type: string) => {
        const iconClass = "h-4 w-4";
        switch (type) {
            case 'video': return <Play className={`${iconClass} text-blue-500`} />;
            case 'document': return <FileText className={`${iconClass} text-green-500`} />;
            case 'link': return <LinkIcon className={`${iconClass} text-purple-500`} />;
            case 'quiz': return <HelpCircle className={`${iconClass} text-orange-500`} />;
            case 'assignment': return <ClipboardList className={`${iconClass} text-red-500`} />;
            default: return <FileText className={iconClass} />;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
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
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="flex-1"
                            >
                                <Link href={`/courses/${course.id}/modules/${module.id}/items/${previousItem.id}`}>
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Link>
                            </Button>
                        ) : (
                            <div className="flex-1" />
                        )}

                        {nextItem ? (
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="flex-1"
                            >
                                <Link href={`/courses/${course.id}/modules/${module.id}/items/${nextItem.id}`}>
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
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
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                        {items.map((item, index) => {
                            const isCompleted = completedItems.includes(item.id);
                            const isCurrent = currentItem?.id === item.id;

                            return (
                                <Link
                                    key={item.id}
                                    href={`/courses/${course.id}/modules/${module.id}/items/${item.id}`}
                                    className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-colors hover:bg-accent ${
                                        isCurrent ? 'bg-accent border border-border' : ''
                                    }`}
                                >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {getItemIcon(item.type)}
                                        <Badge variant="outline" className="text-xs px-1.5 py-0.5 flex-shrink-0">
                                            {index + 1}
                                        </Badge>
                                        <span className="truncate flex-1">
                                            {item.title}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {item.is_required && (
                                            <div className="h-1.5 w-1.5 bg-red-500 rounded-full" />
                                        )}
                                        {item.duration && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Clock className="h-3 w-3" />
                                                {Math.ceil(item.duration / 60)}m
                                            </div>
                                        )}
                                        {isCompleted && (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="border-t pt-4 space-y-2">
                    <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <Link href={`/courses/${course.id}/modules/${module.id}`}>
                            View All Items
                        </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="w-full justify-start">
                        <Link href={`/courses/${course.id}`}>
                            Back to Course
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
