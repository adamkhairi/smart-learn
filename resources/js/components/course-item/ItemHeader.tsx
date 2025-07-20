import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { CheckCircle, ChevronLeft, Clock, Edit, FileText, HelpCircle, Play } from 'lucide-react';
import { Course, Module, ModuleItem } from '@/types';

interface ItemHeaderProps {
    course: Course;
    module: Module;
    item: ModuleItem;
    itemType: 'lecture' | 'assessment' | 'assignment' | 'unknown';
    currentIndex: number;
    totalItems: number;
    isCompleted: boolean;
    isInstructor: boolean;
    duration?: number;
    className?: string;
}

export default function ItemHeader({
    course,
    module,
    item,
    itemType,
    currentIndex,
    totalItems,
    isCompleted,
    isInstructor,
    duration,
    className = ""
}: ItemHeaderProps) {
    const getItemIcon = (type: string) => {
        switch (type) {
            case 'lecture':
                return <Play className="h-5 w-5 text-blue-500" />;
            case 'assessment':
                return <HelpCircle className="h-5 w-5 text-orange-500" />;
            case 'assignment':
                return <FileText className="h-5 w-5 text-red-500" />;
            default:
                return <FileText className="h-5 w-5" />;
        }
    };

    const formatDuration = (durationInSeconds?: number) => {
        if (!durationInSeconds) return null;
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Back Button and Page Title */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" asChild>
                    <Link href={`/courses/${course.id}/modules/${module.id}`}>
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Back to Module
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Module Item Details</h1>
                    <p className="text-muted-foreground">View the details for this module item</p>
                </div>
            </div>

            {/* Item Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <div className="mb-1 flex items-center gap-3">
                            {getItemIcon(itemType)}
                            <h2 className="text-2xl font-bold">{item.title}</h2>

                            {/* Required Badge */}
                            {item.is_required && (
                                <Badge variant="destructive" className="text-xs">
                                    Required
                                </Badge>
                            )}

                            {/* Completed Badge */}
                            {isCompleted && (
                                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Completed
                                </Badge>
                            )}
                        </div>

                        {/* Item Info */}
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <span>
                                {itemType.charAt(0).toUpperCase() + itemType.slice(1)} •
                                Item {currentIndex + 1} of {totalItems} in {module.title}
                            </span>

                            {/* Duration */}
                            {duration && (
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{formatDuration(duration)}</span>
                                </div>
                            )}

                            {/* View Count */}
                            {item.view_count && item.view_count > 0 && (
                                <span>{item.view_count} views</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Button for Instructors */}
                {isInstructor && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
