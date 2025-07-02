import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseModuleShowPageProps, CourseModuleItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
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
    CheckCircle,
    XCircle,
    ExternalLink,
    MoreVertical
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

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

    const handleTogglePublished = () => {
        setProcessingActions(prev => ({ ...prev, [module.id]: true }));
        patch(`/courses/${course.id}/modules/${module.id}/toggle-published`, {
            onFinish: () => {
                setProcessingActions(prev => ({ ...prev, [module.id]: false }));
            }
        });
    };

    const handleDelete = () => {
        confirm({
            title: 'Delete Module',
            description: `Are you sure you want to delete "${module.title}"? This action cannot be undone and will remove all module items.`,
            confirmText: 'Delete Module',
            variant: 'destructive',
            onConfirm: () => {
                router.delete(`/courses/${course.id}/modules/${module.id}`);
            }
        });
    };

    const handleDuplicate = () => {
        setProcessingActions(prev => ({ ...prev, [module.id]: true }));
        router.post(`/courses/${course.id}/modules/${module.id}/duplicate`, {}, {
            onFinish: () => {
                setProcessingActions(prev => ({ ...prev, [module.id]: false }));
            }
        });
    };

    const handleItemDelete = (itemId: number, itemTitle: string) => {
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
    };

    const handleItemDuplicate = (itemId: number) => {
        setProcessingActions(prev => ({ ...prev, [itemId]: true }));
        router.post(`/courses/${course.id}/modules/${module.id}/items/${itemId}/duplicate`, {}, {
            onFinish: () => {
                setProcessingActions(prev => ({ ...prev, [itemId]: false }));
            }
        });
    };

    const handleDragStart = (e: React.DragEvent, itemId: number) => {
        setDraggedItem(itemId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetItemId: number) => {
        e.preventDefault();

        if (!draggedItem || draggedItem === targetItemId) {
            setDraggedItem(null);
            return;
        }

        const items = module.moduleItems || module.module_items || module.items || [];
        const draggedIndex = items.findIndex(item => item.id === draggedItem);
        const targetIndex = items.findIndex(item => item.id === targetItemId);

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
    };

    // Helper function to get item type from polymorphic relationship
    const getItemType = (item: CourseModuleItem): 'lecture' | 'assessment' | 'assignment' | 'unknown' => {
        if (item.item_type_name) return item.item_type_name;

        if (item.itemable_type?.includes('Lecture')) return 'lecture';
        if (item.itemable_type?.includes('Assessment')) return 'assessment';
        if (item.itemable_type?.includes('Assignment')) return 'assignment';

        return 'unknown';
    };

    const getItemIcon = (itemType: string) => {
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
    };

    const formatDuration = (duration?: number) => {
        if (!duration) return null;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // Helper function to get external URL from polymorphic content
    const getExternalUrl = (item: CourseModuleItem): string | null => {
        if (!item.itemable) return null;

        const itemType = getItemType(item);
        if (itemType === 'lecture') {
            return (item.itemable as { video_url?: string })?.video_url || null;
        }

        return null;
    };

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
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{module.title}</h1>
                                {module.is_published ? (
                                    <Badge variant="default" className="self-start bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Published
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="self-start bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                                        <XCircle className="mr-1 h-3 w-3" />
                                        Draft
                                    </Badge>
                                )}
                            </div>

                            {module.description && (
                                <p className="text-sm text-muted-foreground sm:text-base lg:text-lg">
                                    {module.description}
                                </p>
                            )}

                            <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
                                    {(module.moduleItems || module.module_items || module.items || []).length} items
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
                        <div className="flex shrink-0 items-center gap-2">
                            {/* Mobile: Dropdown Menu */}
                            {isMobile ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48">
                                        <DropdownMenuItem asChild>
                                            <Link href={`/courses/${course.id}/modules/${module.id}/items/create`}>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add Item
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href={`/courses/${course.id}/modules/${module.id}/edit`}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit Module
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleTogglePublished}>
                                            {module.is_published ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                            {module.is_published ? 'Unpublish' : 'Publish'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleDuplicate}>
                                            <Copy className="mr-2 h-4 w-4" />
                                            Duplicate
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Module
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                /* Desktop: Individual Buttons */
                                <>
                                    <Button asChild>
                                        <Link href={`/courses/${course.id}/modules/${module.id}/items/create`}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add Item
                                        </Link>
                                    </Button>
                                    <Button variant="outline" asChild>
                                        <Link href={`/courses/${course.id}/modules/${module.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <LoadingButton
                                        variant="outline"
                                        size="default"
                                        loading={processingActions[module.id]}
                                        onClick={handleTogglePublished}
                                    >
                                        {module.is_published ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                                        {module.is_published ? 'Unpublish' : 'Publish'}
                                    </LoadingButton>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="default">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={handleDuplicate}>
                                                <Copy className="mr-2 h-4 w-4" />
                                                Duplicate Module
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Module
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Module Items List - Enhanced for Mobile */}
                <div className="space-y-4 lg:space-y-6">
                    {(module.moduleItems || module.module_items || module.items || []).length === 0 ? (
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
                            {(module.moduleItems || module.module_items || module.items || []).map((item) => {
                                const itemType = getItemType(item);
                                const externalUrl = getExternalUrl(item);
                                const isProcessing = processingActions[item.id];

                                return (
                                    <Card
                                        key={item.id}
                                        className={`group hover:shadow-md transition-all duration-200 ${
                                            draggedItem === item.id ? 'opacity-50' : ''
                                        }`}
                                        draggable={isInstructor && !isMobile}
                                        onDragStart={(e) => handleDragStart(e, item.id)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, item.id)}
                                    >
                                        <CardContent className="p-4 sm:p-6">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                                {/* Drag Handle & Item Info */}
                                                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                                    {/* Drag Handle - Desktop Only */}
                                                    {isInstructor && !isMobile && (
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                                                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                        </div>
                                                    )}

                                                    {/* Item Type Icon */}
                                                    <div className="flex-shrink-0">
                                                        {getItemIcon(itemType)}
                                                    </div>

                                                    {/* Item Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                                                            <h3 className="font-semibold text-sm sm:text-base line-clamp-1">
                                                                {item.title}
                                                            </h3>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {itemType}
                                                                </Badge>
                                                                {item.status === 'published' ? (
                                                                    <Badge variant="default" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                                                        Published
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        Draft
                                                                    </Badge>
                                                                )}
                                                                {item.is_required && (
                                                                    <Badge variant="outline" className="text-xs border-red-200 text-red-700 dark:border-red-800 dark:text-red-300">
                                                                        Required
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {item.description && (
                                                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                {item.description}
                                                            </p>
                                                        )}

                                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                            <span>#{item.order}</span>
                                                            {item.duration && (
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {formatDuration(item.duration)}
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
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex items-center gap-2 justify-end sm:justify-start">
                                                    {/* Primary Action */}
                                                    <Button
                                                        size="sm"
                                                        asChild
                                                        className="flex-1 sm:flex-initial"
                                                    >
                                                        <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            <span className="hidden sm:inline">View</span>
                                                            <span className="sm:hidden">View</span>
                                                        </Link>
                                                    </Button>

                                                    {/* External Link */}
                                                    {externalUrl && (
                                                        <Button variant="outline" size="sm" asChild>
                                                            <a href={externalUrl} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                    )}

                                                    {/* Instructor Actions */}
                                                    {isInstructor && (
                                                        <>
                                                            {/* Mobile: Dropdown */}
                                                            {isMobile ? (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="outline" size="sm">
                                                                            <MoreVertical className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-40">
                                                                        <DropdownMenuItem asChild>
                                                                            <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}/edit`}>
                                                                                <Edit className="mr-2 h-4 w-4" />
                                                                                Edit
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleItemDuplicate(item.id)}
                                                                            disabled={isProcessing}
                                                                        >
                                                                            <Copy className="mr-2 h-4 w-4" />
                                                                            Duplicate
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            onClick={() => handleItemDelete(item.id, item.title)}
                                                                            className="text-destructive"
                                                                        >
                                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            ) : (
                                                                /* Desktop: Individual Buttons */
                                                                <>
                                                                    <Button variant="outline" size="sm" asChild>
                                                                        <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}/edit`}>
                                                                            <Edit className="h-4 w-4" />
                                                                        </Link>
                                                                    </Button>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="outline" size="sm">
                                                                                <MoreVertical className="h-4 w-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuItem
                                                                                onClick={() => handleItemDuplicate(item.id)}
                                                                                disabled={isProcessing}
                                                                            >
                                                                                <Copy className="mr-2 h-4 w-4" />
                                                                                Duplicate Item
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem
                                                                                onClick={() => handleItemDelete(item.id, item.title)}
                                                                                className="text-destructive"
                                                                            >
                                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                                Delete Item
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Add Item Button - Instructor Only */}
                    {isInstructor && (module.moduleItems || module.module_items || module.items || []).length > 0 && (
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
