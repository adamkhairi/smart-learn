import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { ActionButton, ActionMenu, commonActions } from '@/components/ui/action-button';
import { PageHeader } from '@/components/ui/page-header';
import { ModuleItemCard } from '@/components/course-module/module-item-card';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useDragDrop } from '@/hooks/use-drag-drop';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseModuleShowPageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Clock,
    Edit,
    Eye,
    EyeOff,
    FileText,
    Plus,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';

function Show({ course, module }: CourseModuleShowPageProps) {
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

    // Use drag and drop hook
    const { draggedItem, handleDragStart, handleDragOver, handleDrop } = useDragDrop({
        reorderUrl: `/courses/${course.id}/modules/${module.id}/items/{id}/reorder`,
    });

    // Callback handlers - useCallback to prevent unnecessary re-renders
    const handleTogglePublished = useCallback(() => {
        setProcessingActions((prev) => ({ ...prev, [module.id]: true }));
        patch(`/courses/${course.id}/modules/${module.id}/toggle-published`, {
            onFinish: () => {
                setProcessingActions((prev) => ({ ...prev, [module.id]: false }));
            },
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
            },
        });
    }, [confirm, module.title, course.id, module.id]);

    const handleDuplicate = useCallback(() => {
        setProcessingActions((prev) => ({ ...prev, [module.id]: true }));
        router.post(
            `/courses/${course.id}/modules/${module.id}/duplicate`,
            {},
            {
                onFinish: () => {
                    setProcessingActions((prev) => ({ ...prev, [module.id]: false }));
                },
            },
        );
    }, [module.id, course.id]);

    const handleItemEdit = useCallback(
        (itemId: number) => {
            router.visit(`/courses/${course.id}/modules/${module.id}/items/${itemId}/edit`);
        },
        [course.id, module.id],
    );

    const handleItemDelete = useCallback(
        (itemId: number, itemTitle: string) => {
            confirm({
                title: 'Delete Item',
                description: `Are you sure you want to delete "${itemTitle}"? This action cannot be undone.`,
                confirmText: 'Delete Item',
                variant: 'destructive',
                onConfirm: () => {
                    setProcessingActions((prev) => ({ ...prev, [itemId]: true }));
                    router.delete(`/courses/${course.id}/modules/${module.id}/items/${itemId}`, {
                        onFinish: () => {
                            setProcessingActions((prev) => ({ ...prev, [itemId]: false }));
                        },
                    });
                },
            });
        },
        [confirm, course.id, module.id],
    );

    const handleItemDuplicate = useCallback(
        (itemId: number) => {
            setProcessingActions((prev) => ({ ...prev, [itemId]: true }));
            router.post(
                `/courses/${course.id}/modules/${module.id}/items/${itemId}/duplicate`,
                {},
                {
                    onFinish: () => {
                        setProcessingActions((prev) => ({ ...prev, [itemId]: false }));
                    },
                },
            );
        },
        [course.id, module.id],
    );

    // Memoize action menu items for module
    const moduleActionItems = useMemo(() => [
        commonActions.duplicate(handleDuplicate),
        commonActions.delete(handleDelete),
    ], [handleDuplicate, handleDelete]);

    // Memoize page header actions
    const pageHeaderActions = useMemo(() => {
        if (!isInstructor) return null;

        return (
            <>
                <Button variant="outline" size={isMobile ? 'sm' : 'default'} asChild>
                    <Link href={`/courses/${course.id}/modules/${module.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Edit Module</span>
                        <span className="sm:hidden">Edit</span>
                    </Link>
                </Button>

                <ActionButton
                    variant="outline"
                    size={isMobile ? 'sm' : 'default'}
                    loading={processingActions[module.id]}
                    onClick={handleTogglePublished}
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
                </ActionButton>

                <ActionMenu items={moduleActionItems} />
            </>
        );
    }, [isInstructor, isMobile, course.id, module.id, module.is_published, processingActions, handleTogglePublished, moduleActionItems]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${module.title} - ${course.name}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 lg:gap-6 lg:p-6">
                {/* Page Header */}
                <PageHeader
                    title={module.title}
                    description={module.description}
                    backUrl={`/courses/${course.id}/modules`}
                    backLabel={isMobile ? 'Back' : 'Back to Modules'}
                    actions={pageHeaderActions}
                    badges={[
                        {
                            label: module.is_published ? 'Published' : 'Draft',
                            variant: module.is_published ? 'default' : 'secondary',
                        } as any,
                    ].map(badge => ({
                        ...badge,
                        className: module.is_published 
                            ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800'
                            : 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-800'
                    }))}
                    stats={[
                        {
                            label: 'items',
                            value: moduleItems.length,
                            icon: <FileText className="h-3 w-3 sm:h-4 sm:w-4" />,
                        },
                        {
                            label: 'Module',
                            value: module.order,
                            icon: <Clock className="h-3 w-3 sm:h-4 sm:w-4" />,
                        },
                    ]}
                />

                {/* Module Items List */}
                <div className="space-y-4 lg:space-y-6">
                    {moduleItems.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12 sm:py-16">
                                <FileText className="mb-4 h-12 w-12 text-muted-foreground sm:h-16 sm:w-16" />
                                <h3 className="mb-2 text-lg font-semibold sm:text-xl">No module items yet</h3>
                                <p className="mb-6 max-w-md text-center text-sm text-muted-foreground sm:text-base">
                                    {isInstructor
                                        ? 'Start building your module by adding lectures, assignments, or assessments'
                                        : "This module doesn't have any content yet"}
                                </p>
                                {isInstructor && (
                                    <Button asChild size={isMobile ? 'sm' : 'default'}>
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
                                    onDragStart={handleDragStart}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, item.id, moduleItems)}
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
                            <Button variant="outline" asChild size={isMobile ? 'sm' : 'default'}>
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
