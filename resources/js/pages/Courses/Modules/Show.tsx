import React, { useState, useMemo, useCallback } from 'react';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseModuleShowPageProps, CourseModuleItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ContentPreview, QuestionPreview } from '@/components/content-preview';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingButton } from '@/components/ui/loading-button';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import {
    ArrowLeft,
    Plus,
    Edit,
    Eye,
    EyeOff,
    Copy,
    Trash2,
    GripVertical,
    Play,
    FileText,
    HelpCircle,
    ClipboardList,
    Clock,
    ExternalLink,
    MoreVertical
} from 'lucide-react';
import { useForm } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';

// Memoized module item component for better performance
const ModuleItemCard = React.memo<{
    item: CourseModuleItem;
    isInstructor: boolean;
    isMobile: boolean;
    draggedItem: number | null;
    isProcessing: boolean;
    onDragStart: (e: React.DragEvent, itemId: number) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, itemId: number) => void;
    onEdit: (itemId: number) => void;
    onDelete: (itemId: number, title: string) => void;
    onDuplicate: (itemId: number) => void;
    courseId: number;
    moduleId: number;
}>(function ModuleItemCard({
    item,
    isInstructor,
    isMobile,
    draggedItem,
    isProcessing,
    onDragStart,
    onDragOver,
    onDrop,
    onEdit,
    onDelete,
    onDuplicate,
    courseId,
    moduleId
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
            return (item.itemable as { video_url?: string })?.video_url || null;
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

    return (
        <Card
            className={`group hover:shadow-md transition-all duration-200 ${
                draggedItem === item.id ? 'opacity-50' : ''
            }`}
            draggable={isInstructor && !isMobile}
            onDragStart={(e) => onDragStart(e, item.id)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, item.id)}
        >
            <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                    {/* Drag Handle & Icon */}
                    <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                        {isInstructor && !isMobile && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div>
                                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity" />
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
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-semibold text-base sm:text-lg truncate">
                                        <Link
                                            href={`/courses/${courseId}/modules/${moduleId}/items/${item.id}`}
                                            className="hover:text-primary transition-colors cursor-pointer"
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
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                        {item.description}
                                    </p>
                                )}

                                {/* Lazy-loaded content preview */}
                                {item.itemable && itemType !== 'unknown' && (
                                    <>
                                        <ContentPreview
                                            content={{
                                                content_html: (item.itemable as Record<string, unknown>).content_html as string,
                                                content_json: (item.itemable as Record<string, unknown>).content_json as string | object,
                                                content: (item.itemable as Record<string, unknown>).content as string
                                            }}
                                            type={itemType as 'lecture' | 'assessment' | 'assignment'}
                                        />

                                        {/* Assessment Questions Preview */}
                                        {itemType === 'assessment' && (item.itemable as Record<string, unknown>).questions && (
                                            <QuestionPreview questions={(item.itemable as Record<string, unknown>).questions as Array<{id: number; question_text: string; type: string; points: number}>} />
                                        )}
                                    </>
                                )}

                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
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
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <Button size="sm" asChild>
                                    <Link href={`/courses/${courseId}/modules/${moduleId}/items/${item.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </Link>
                                </Button>

                                {/* Instructor Options Menu */}
                                {isInstructor && (
                                    <DropdownMenu>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" disabled={isProcessing}>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>More options</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <DropdownMenuContent align="end" className="w-48">
                                            <DropdownMenuItem onClick={() => onEdit(item.id)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Item
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => onDuplicate(item.id)}>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Duplicate
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => onDelete(item.id, item.title)}
                                                className="text-red-600 focus:text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>

                        {/* External Link - Only if exists */}
                        {externalUrl && (
                            <div className="flex items-center gap-2 mt-3">
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

function Show({ course, module }: CourseModuleShowPageProps) {
    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [processingActions, setProcessingActions] = useState<Record<number, boolean>>({});

    const { patch } = useForm();
    const { canManageCourse } = useAuth();
    const { confirm, confirmDialog } = useConfirmDialog();
    const isMobile = useIsMobile();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: '/courses' },
        { title: course.name, href: `/courses/${course.id}` },
        { title: 'Modules', href: `/courses/${course.id}/modules` },
        { title: module.title, href: '#' },
    ];

    const isInstructor = canManageCourse(course.created_by);

    // Memoize module items to avoid recalculation
    const moduleItems = useMemo(() => {
        return module.moduleItems || module.module_items || module.items || [];
    }, [module.moduleItems, module.module_items, module.items]);

    // Callback handlers - useCallback to prevent unnecessary re-renders
    const handleTogglePublished = useCallback(() => {
        setProcessingActions(prev => ({ ...prev, [module.id]: true }));
        patch(`/courses/${course.id}/modules/${module.id}/toggle-published`, {
            onFinish: () => {
                setProcessingActions(prev => ({ ...prev, [module.id]: false }));
            }
        });
    }, [module.id, course.id, patch]);

    const handleDelete = useCallback(() => {
        confirm({
            title: 'Delete Module',
            description: `Are you sure you want to delete "${module.title}"? This action cannot be undone and will remove all module items.`,
            confirmText: 'Delete Module',
            variant: 'destructive',
            onConfirm: () => {
                router.delete(`/courses/${course.id}/modules/${module.id}`);
            }
        });
    }, [confirm, module.title, course.id, module.id]);

    const handleDuplicate = useCallback(() => {
        setProcessingActions(prev => ({ ...prev, [module.id]: true }));
        router.post(`/courses/${course.id}/modules/${module.id}/duplicate`, {}, {
            onFinish: () => {
                setProcessingActions(prev => ({ ...prev, [module.id]: false }));
            }
        });
    }, [module.id, course.id]);

    const handleItemEdit = useCallback((itemId: number) => {
        router.visit(`/courses/${course.id}/modules/${module.id}/items/${itemId}/edit`);
    }, [course.id, module.id]);

    const handleItemDelete = useCallback((itemId: number, itemTitle: string) => {
        confirm({
            title: 'Delete Item',
            description: `Are you sure you want to delete "${itemTitle}"? This action cannot be undone.`,
            confirmText: 'Delete Item',
            variant: 'destructive',
            onConfirm: () => {
                setProcessingActions(prev => ({ ...prev, [itemId]: true }));
                router.delete(`/courses/${course.id}/modules/${module.id}/items/${itemId}`, {
                    onFinish: () => {
                        setProcessingActions(prev => ({ ...prev, [itemId]: false }));
                    }
                });
            }
        });
    }, [confirm, course.id, module.id]);

    const handleItemDuplicate = useCallback((itemId: number) => {
        setProcessingActions(prev => ({ ...prev, [itemId]: true }));
        router.post(`/courses/${course.id}/modules/${module.id}/items/${itemId}/duplicate`, {}, {
            onFinish: () => {
                setProcessingActions(prev => ({ ...prev, [itemId]: false }));
            }
        });
    }, [course.id, module.id]);

    const handleDragStart = useCallback((e: React.DragEvent, itemId: number) => {
        setDraggedItem(itemId);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetItemId: number) => {
        e.preventDefault();

        if (!draggedItem || draggedItem === targetItemId) {
            setDraggedItem(null);
            return;
        }

        const draggedIndex = moduleItems.findIndex(item => item.id === draggedItem);
        const targetIndex = moduleItems.findIndex(item => item.id === targetItemId);

        if (draggedIndex === -1 || targetIndex === -1) {
            setDraggedItem(null);
            return;
        }

        // Simple API call to update order
        router.patch(`/courses/${course.id}/modules/${module.id}/items/${draggedItem}/reorder`, {
            target_position: targetIndex + 1
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setDraggedItem(null);
            },
            onError: (errors) => {
                console.error('Failed to reorder items:', errors);
                setDraggedItem(null);
            }
        });
    }, [draggedItem, moduleItems, course.id, module.id]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${module.title} - ${course.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 lg:gap-6 overflow-x-auto rounded-xl p-4 lg:p-6">
                {/* Enhanced Header - Mobile Optimized */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-3 sm:mb-4">
                            <Button variant="ghost" size={isMobile ? "sm" : "default"} asChild>
                                <Link href={`/courses/${course.id}/modules`}>
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Back to Modules</span>
                                    <span className="sm:hidden">Back</span>
                                </Link>
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl sm:text-3xl font-bold truncate">{module.title}</h1>
                                <Badge variant={module.is_published ? 'default' : 'secondary'}>
                                    {module.is_published ? 'Published' : 'Draft'}
                                </Badge>
                            </div>

                            {module.description && (
                                <p className="text-sm sm:text-base text-muted-foreground max-w-3xl">
                                    {module.description}
                                </p>
                            )}

                            <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {moduleItems.length} items
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                    Module {module.order}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Responsive */}
                    {isInstructor && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button variant="outline" size={isMobile ? "sm" : "default"} asChild>
                                <Link href={`/courses/${course.id}/modules/${module.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    <span className="hidden sm:inline">Edit Module</span>
                                    <span className="sm:hidden">Edit</span>
                                </Link>
                            </Button>

                            <LoadingButton
                                variant="outline"
                                size={isMobile ? "sm" : "default"}
                                onClick={handleTogglePublished}
                                loading={processingActions[module.id]}
                            >
                                {module.is_published ? (
                                    <>
                                        <EyeOff className="mr-2 h-4 w-4" />
                                        <span className="hidden sm:inline">Unpublish</span>
                                        <span className="sm:hidden">Hide</span>
                                    </>
                                ) : (
                                    <>
                                        <Eye className="mr-2 h-4 w-4" />
                                        <span className="hidden sm:inline">Publish</span>
                                        <span className="sm:hidden">Show</span>
                                    </>
                                )}
                            </LoadingButton>

                            <DropdownMenu>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size={isMobile ? "sm" : "default"}>
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Module options</p>
                                    </TooltipContent>
                                </Tooltip>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={handleDuplicate}>
                                        <Copy className="mr-2 h-4 w-4" />
                                        Duplicate Module
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleDelete}
                                        className="text-red-600 focus:text-red-600"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Module
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                {/* Module Items List - Enhanced for Mobile */}
                <div className="space-y-4 lg:space-y-6">
                    {moduleItems.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                                <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
                                <h3 className="text-lg sm:text-xl font-semibold mb-2">No module items yet</h3>
                                <p className="text-sm sm:text-base text-muted-foreground text-center mb-6 max-w-md">
                                    {isInstructor
                                        ? "Start building your module by adding lectures, assignments, or assessments"
                                        : "This module doesn't have any content yet"
                                    }
                                </p>
                                {isInstructor && (
                                    <Button asChild size={isMobile ? "sm" : "default"}>
                                        <Link href={`/courses/${course.id}/modules/${module.id}/items/create`}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add First Item
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {moduleItems.map((item) => (
                                <ModuleItemCard
                                    key={item.id}
                                    item={item}
                                    isInstructor={isInstructor}
                                    isMobile={isMobile}
                                    draggedItem={draggedItem}
                                    isProcessing={processingActions[item.id]}
                                    onDragStart={handleDragStart}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onEdit={handleItemEdit}
                                    onDelete={handleItemDelete}
                                    onDuplicate={handleItemDuplicate}
                                    courseId={course.id}
                                    moduleId={module.id}
                                />
                            ))}
                        </div>
                    )}

                    {/* Add Item Button - Instructor Only */}
                    {isInstructor && moduleItems.length > 0 && (
                        <div className="flex justify-center pt-4">
                            <Button variant="outline" asChild size={isMobile ? "sm" : "default"}>
                                <Link href={`/courses/${course.id}/modules/${module.id}/items/create`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Another Item
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {confirmDialog}
            </div>
        </AppLayout>
    );
}

export default Show;
