import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, HelpCircle, Play } from 'lucide-react';
import { ModuleItem } from '@/types';
import { ReactNode } from 'react';

interface ItemContentCardProps {
    item: ModuleItem;
    itemType: 'lecture' | 'assessment' | 'assignment' | 'unknown';
    children: ReactNode;
    duration?: number;
    className?: string;
}

export default function ItemContentCard({
    item,
    itemType,
    children,
    duration,
    className = ""
}: ItemContentCardProps) {
    const getItemIcon = (type: string) => {
        switch (type) {
            case 'lecture':
                return <Play className="h-5 w-5 text-blue-500" />;
            case 'assessment':
                return <HelpCircle className="h-5 w-5 text-orange-500" />;
            case 'assignment':
                return <FileText className="h-5 w-5 text-red-500" />;
            default:
                return <FileText className="h-5 w-5 text-gray-500" />;
        }
    };

    const formatDuration = (durationInSeconds?: number) => {
        if (!durationInSeconds) return null;
        const minutes = Math.floor(durationInSeconds / 60);
        const seconds = durationInSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    return (
        <Card className={`shadow-sm transition-shadow hover:shadow-md ${className}`}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                        <CardTitle className="flex items-center gap-3 mb-2">
                            {getItemIcon(itemType)}
                            <span className="truncate">{item.title}</span>
                        </CardTitle>
                        {item.description && (
                            <CardDescription className="line-clamp-2">
                                {item.description}
                            </CardDescription>
                        )}
                    </div>

                    {/* Item Metadata */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground ml-4">
                        {/* Duration Display */}
                        {duration && (
                            <div className="flex items-center gap-1 shrink-0">
                                <span className="text-xs">⏱️</span>
                                <span>{formatDuration(duration)}</span>
                            </div>
                        )}

                        {/* View Count */}
                        {item.view_count && item.view_count > 0 && (
                            <div className="flex items-center gap-1 shrink-0">
                                <span className="text-xs">👁️</span>
                                <span>{item.view_count}</span>
                            </div>
                        )}

                        {/* Item Type Badge */}
                        <div className="shrink-0">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                itemType === 'lecture'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                    : itemType === 'assessment'
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                    : itemType === 'assignment'
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}>
                                {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                {children}
            </CardContent>
        </Card>
    );
}
