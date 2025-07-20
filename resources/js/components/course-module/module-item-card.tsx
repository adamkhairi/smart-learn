import { ContentPreview, QuestionPreview } from '@/components/content-preview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ActionMenu, commonActions } from '@/components/ui/action-button';
import { Link } from '@inertiajs/react';
import {
    ClipboardList,
    Clock,
    ExternalLink,
    Eye,
    FileText,
    GripVertical,
    HelpCircle,
    Play,
} from 'lucide-react';
import React, { useMemo } from 'react';
import { CourseModuleItem } from '@/types';

interface ModuleItemCardProps {
    item: CourseModuleItem;
    isInstructor: boolean;
    isMobile: boolean;
    draggedItem: number | null;
    onDragStart: (e: React.DragEvent, itemId: number) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, itemId: number) => void;
    onEdit: (itemId: number) => void;
    onDelete: (itemId: number, title: string) => void;
    onDuplicate: (itemId: number) => void;
    courseId: number;
    moduleId: number;
}

export const ModuleItemCard = React.memo<ModuleItemCardProps>(function ModuleItemCard({
    item,
    isInstructor,
    isMobile,
    draggedItem,
    onDragStart,
    onDragOver,
    onDrop,
    onEdit,
    onDelete,
    onDuplicate,
    courseId,
    moduleId,
}) {
    // Memoize item type calculation
    const itemType = useMemo(() => {
        if (item.item_type_name) return item.item_type_name;
        if (item.itemable_type?.includes('Lecture')) return 'lecture';
        if (item.itemable_type?.includes('Assessment')) return 'assessment';
        if (item.itemable_type?.includes('Assignment')) return 'assignment';
        return 'unknown';
    }, [item.item_type_name, item.itemable_type]);

    // Memoize icon
    const itemIcon = useMemo(() => {
        switch (itemType) {
            case 'lecture':
                return <Play className="h-4 w-4 text-blue-500" />;
            case 'assessment':
                return <HelpCircle className="h-4 w-4 text-orange-500" />;
            case 'assignment':
                return <ClipboardList className="h-4 w-4 text-red-500" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    }, [itemType]);

    // Memoize external URL
    const externalUrl = useMemo(() => {
        if (!item.itemable) return null;
        if (itemType === 'lecture') {
            return (item.itemable as unknown as { video_url?: string })?.video_url || null;
        }
        return null;
    }, [item.itemable, itemType]);

    // Memoize duration formatting
    const formattedDuration = useMemo(() => {
        if (!item.duration) return null;
        const minutes = Math.floor(item.duration / 60);
        const seconds = item.duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, [item.duration]);

    // Memoize action menu items
    const actionItems = useMemo(() => [
        commonActions.edit(() => onEdit(item.id)),
        commonActions.duplicate(() => onDuplicate(item.id)),
        commonActions.delete(() => onDelete(item.id, item.title)),
    ], [onEdit, onDuplicate, onDelete, item.id, item.title]);

    return (
        <Card
            className={`group transition-all duration-200 hover:shadow-md ${draggedItem === item.id ? 'opacity-50' : ''}`}
            draggable={isInstructor && !isMobile}
            onDragStart={(e) => onDragStart(e, item.id)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, item.id)}
        >
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                    {/* Drag Handle & Icon */}
                    <div className="mt-1 flex flex-shrink-0 items-center gap-2">
                        {isInstructor && !isMobile && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing" />
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Drag to reorder</p>
                                </TooltipContent>
                            </Tooltip>
                        )}
                        {itemIcon}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center gap-3">
                                    <h3 className="truncate text-base font-semibold sm:text-lg">
                                        <Link
                                            href={`/courses/${courseId}/modules/${moduleId}/items/${item.id}`}
                                            className="cursor-pointer transition-colors hover:text-primary"
                                        >
                                            {item.title}
                                        </Link>
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={item.is_required ? 'default' : 'secondary'} className="text-xs">
                                            {item.is_required ? 'Required' : 'Optional'}
                                        </Badge>
                                        {item.status === 'draft' && (
                                            <Badge variant="outline" className="text-xs">
                                                Draft
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {item.description && (
                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                        {item.description}
                                    </p>
                                )}

                                {/* Lazy-loaded content preview */}
                                {item.itemable && itemType !== 'unknown' && (
                                    <>
                                        <ContentPreview
                                            content={{
                                                content_html: (item.itemable as unknown as Record<string, unknown>).content_html as string,
                                                content_json: (item.itemable as unknown as Record<string, unknown>).content_json as string | object,
                                                content: (item.itemable as unknown as Record<string, unknown>).content as string,
                                            }}
                                            type={itemType as 'lecture' | 'assessment' | 'assignment'}
                                        />

                                        {/* Assessment Questions Preview */}
                                        {itemType === 'assessment' && (item.itemable as unknown as Record<string, unknown>).questions && (
                                            <QuestionPreview
                                                questions={
                                                    (item.itemable as unknown as Record<string, unknown>).questions as Array<{
                                                        id: number;
                                                        question_text: string;
                                                        type: string;
                                                        points: number;
                                                    }>
                                                }
                                            />
                                        )}
                                    </>
                                )}

                                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>#{item.order}</span>
                                    {formattedDuration && (
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {formattedDuration}
                                        </span>
                                    )}
                                    {item.view_count > 0 && (
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-3 w-3" />
                                            {item.view_count} views
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions in top right */}
                            <div className="flex flex-shrink-0 items-center gap-2">
                                <Button size="sm" asChild>
                                    <Link href={`/courses/${courseId}/modules/${moduleId}/items/${item.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </Link>
                                </Button>

                                {/* Instructor Options Menu */}
                                {isInstructor && (
                                    <ActionMenu
                                        items={actionItems}
                                    />
                                )}
                            </div>
                        </div>

                        {/* External Link - Only if exists */}
                        {externalUrl && (
                            <div className="mt-3 flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="sm" asChild>
                                            <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Open external link</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});
