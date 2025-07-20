import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Course, Module, ModuleItem } from '@/types';

interface ItemNavigationProps {
    course: Course;
    module: Module;
    currentItem: ModuleItem;
    items?: ModuleItem[];
    className?: string;
}

export default function ItemNavigation({
    course,
    module,
    currentItem,
    items = module.moduleItems || [],
    className = ""
}: ItemNavigationProps) {
    // Find current item index and previous/next items
    const currentIndex = items.findIndex((item) => item.id === currentItem.id);
    const previousItem = currentIndex > 0 ? items[currentIndex - 1] : null;
    const nextItem = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

    // Don't render if there are no navigation options
    if (!previousItem && !nextItem) {
        return null;
    }

    return (
        <div className={`flex items-center justify-between gap-4 ${className}`}>
            {/* Previous Item Button */}
            {previousItem ? (
                <Button variant="outline" size="lg" asChild className="flex-1 max-w-md">
                    <Link href={`/courses/${course.id}/modules/${module.id}/items/${previousItem.id}`}>
                        <ChevronLeft className="mr-2 h-4 w-4 shrink-0" />
                        <div className="min-w-0 text-left">
                            <div className="text-xs text-muted-foreground">Previous</div>
                            <div className="truncate font-medium">{previousItem.title}</div>
                        </div>
                    </Link>
                </Button>
            ) : (
                <div className="flex-1 max-w-md" />
            )}

            {/* Progress Indicator */}
            <div className="flex flex-col items-center gap-1 text-center">
                <div className="text-xs text-muted-foreground">Progress</div>
                <div className="text-sm font-medium">
                    {currentIndex + 1} of {items.length}
                </div>
                <div className="flex gap-1">
                    {items.map((_, index) => (
                        <div
                            key={index}
                            className={`h-1.5 w-1.5 rounded-full transition-colors ${
                                index === currentIndex
                                    ? 'bg-primary'
                                    : index < currentIndex
                                    ? 'bg-green-500'
                                    : 'bg-gray-200 dark:bg-gray-700'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Next Item Button */}
            {nextItem ? (
                <Button size="lg" asChild className="flex-1 max-w-md">
                    <Link href={`/courses/${course.id}/modules/${module.id}/items/${nextItem.id}`}>
                        <div className="min-w-0 text-right">
                            <div className="text-xs text-white/80">Next</div>
                            <div className="truncate font-medium">{nextItem.title}</div>
                        </div>
                        <ChevronRight className="ml-2 h-4 w-4 shrink-0" />
                    </Link>
                </Button>
            ) : (
                <div className="flex-1 max-w-md" />
            )}
        </div>
    );
}
