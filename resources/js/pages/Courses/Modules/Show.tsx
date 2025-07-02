import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseModuleShowPageProps, CourseModuleItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingButton } from '@/components/ui/loading-button';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { ModuleItemPreview } from '@/components/module-item-preview';
import { useAuth } from '@/hooks/use-auth';
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
    ExternalLink
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

function Show({ course, module }: CourseModuleShowPageProps) {
    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [processingActions, setProcessingActions] = useState<Record<number, boolean>>({});

    const { patch } = useForm();
    const { canManageCourse } = useAuth();
    const { confirm, confirmDialog } = useConfirmDialog();

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
            return (item.itemable as any)?.video_url || null;
        }

        return null;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${module.title} - ${course.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/courses/${course.id}/modules`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Modules
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold">{module.title}</h1>
                                {module.is_published ? (
                                    <Badge variant="default" className="text-xs">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Published
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-xs">
                                        <XCircle className="mr-1 h-3 w-3" />
                                        Draft
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">
                                Module {module.order} in {course.name}
                            </p>
                        </div>
                    </div>

                    {isInstructor && (
                        <div className="flex items-center gap-2">
                            <LoadingButton
                                variant="ghost"
                                size="sm"
                                loading={processingActions[module.id]}
                                onClick={handleTogglePublished}
                            >
                                {module.is_published ? (
                                    <>
                                        <EyeOff className="mr-2 h-4 w-4" />
                                        Unpublish
                                    </>
                                ) : (
                                    <>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Publish
                                    </>
                                )}
                            </LoadingButton>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/courses/${course.id}/modules/${module.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Module
                                </Link>
                            </Button>
                            <LoadingButton
                                variant="outline"
                                size="sm"
                                loading={processingActions[module.id]}
                                onClick={handleDuplicate}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                            </LoadingButton>
                            <LoadingButton
                                variant="outline"
                                size="sm"
                                loading={processingActions[module.id]}
                                onClick={handleDelete}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </LoadingButton>
                        </div>
                    )}
                </div>

                {/* Module Description */}
                {module.description && (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-muted-foreground">{module.description}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Module Items */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Module Content</h2>
                    {isInstructor && (
                        <Button asChild>
                            <Link href={`/courses/${course.id}/modules/${module.id}/items/create`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Item
                            </Link>
                        </Button>
                    )}
                </div>

                {(module.moduleItems || module.module_items || module.items) &&
                 (module.moduleItems || module.module_items || module.items)!.length > 0 ? (
                    <div className="space-y-3">
                        {(module.moduleItems || module.module_items || module.items)!.map((item, index) => (
                            <Card
                                key={item.id}
                                className={`transition-all duration-200 hover:shadow-md ${
                                    draggedItem === item.id ? 'opacity-50 scale-95' : ''
                                }`}
                                draggable={isInstructor}
                                onDragStart={(e) => handleDragStart(e, item.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, item.id)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            {isInstructor && (
                                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                            )}

                                            <div className="flex items-center gap-3">
                                                {getItemIcon(getItemType(item))}
                                                <Badge variant="outline" className="text-xs">
                                                    {index + 1}
                                                </Badge>
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-medium">{item.title}</h3>
                                                    {item.is_required && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            Required
                                                        </Badge>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="capitalize">{getItemType(item)}</span>
                                                    {item.duration && (
                                                        <>
                                                            <span>•</span>
                                                            <div className="flex items-center gap-1">
                                                                <Clock className="h-3 w-3" />
                                                                {formatDuration(item.duration)}
                                                            </div>
                                                        </>
                                                    )}
                                                    {item.description && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="max-w-md truncate">
                                                                {item.description}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Quick Access Actions */}
                                            {getItemType(item) === 'lecture' && getExternalUrl(item) && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a
                                                        href={getExternalUrl(item) || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}

                                                                        {/* Preview Button */}
                            <ModuleItemPreview
                                item={item}
                                courseId={course.id}
                                moduleId={module.id}
                                trigger={
                                    <Button variant="ghost" size="sm">
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                }
                            />

                                            {/* Full View Button */}
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}`}>
                                                    View
                                                </Link>
                                            </Button>

                                            {isInstructor && (
                                                <>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <LoadingButton
                                                        variant="ghost"
                                                        size="sm"
                                                        loading={processingActions[item.id]}
                                                        onClick={() => handleItemDuplicate(item.id)}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </LoadingButton>
                                                    <LoadingButton
                                                        variant="ghost"
                                                        size="sm"
                                                        loading={processingActions[item.id]}
                                                        onClick={() => handleItemDelete(item.id, item.title)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </LoadingButton>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No content yet</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                {isInstructor
                                    ? "Start adding content to this module"
                                    : "This module doesn't have any content yet."
                                }
                            </p>
                            {isInstructor && (
                                <Button asChild>
                                    <Link href={`/courses/${course.id}/modules/${module.id}/items/create`}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add First Item
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Confirm Dialog */}
                {confirmDialog}
            </div>
        </AppLayout>
    );
}

export default Show;
