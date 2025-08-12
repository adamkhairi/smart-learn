import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/use-auth';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseModule, CourseModulesPageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    BookOpen,
    Calendar,
    CheckCircle,
    Clock,
    Copy,
    Edit,
    Eye,
    EyeOff,
    FileText,
    Filter,
    GripVertical,
    Plus,
    Search,
    Trash2,
    XCircle,
    ChevronDown,
    ChevronUp,
    CheckSquare,
    ClipboardList,
} from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type ModulesIndexProps = CourseModulesPageProps;

function Index({ course, modules }: ModulesIndexProps) {
    const [localModules, setLocalModules] = useState<CourseModule[]>(modules); // New state
    const [draggedModule, setDraggedModule] = useState<number | null>(null);
    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [processingActions, setProcessingActions] = useState<Record<number, boolean>>({});
    const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set());
    const [selectedModuleIds, setSelectedModuleIds] = useState<Set<number>>(new Set()); // New state for selected modules

    const { patch } = useForm(); // setData is no longer needed from useForm
    const { canManageCourse } = useAuth();
    const { confirm, confirmDialog } = useConfirmDialog();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: '/courses' },
        { title: course.name, href: `/courses/${course.id}` },
        { title: 'Modules', href: '#' },
    ];

    const isInstructor = canManageCourse(course.created_by);
    const isStudent = !isInstructor;

    // Filter modules based on user role - students only see published modules
    const visibleModules = isStudent ? localModules.filter((module) => module.is_published) : localModules; // Use localModules

    const handleTogglePublished = (moduleId: number, moduleTitle: string, isPublished: boolean) => {
        setProcessingActions((prev) => ({ ...prev, [moduleId]: true }));
        patch(`/courses/${course.id}/modules/${moduleId}/toggle-published`, {
            onSuccess: () => {
                // showSuccess(`Module "${moduleTitle}" ${isPublished ? 'unpublished' : 'published'} successfully.`);
                // Update local state directly after success
                setLocalModules((prevModules) =>
                    prevModules.map((m) =>
                        m.id === moduleId ? { ...m, is_published: !isPublished } : m
                    )
                );
            },
            onError: () => {
               // showError(`Failed to ${isPublished ? 'unpublish' : 'publish'} module "${moduleTitle}". Please try again.`);
            },
            onFinish: () => {
                setProcessingActions((prev) => ({ ...prev, [moduleId]: false }));
            },
        });
    };

    const handleDelete = (moduleId: number, moduleTitle: string) => {
        confirm({
            title: 'Delete Module',
            description: `Are you sure you want to delete "${moduleTitle}"? This action cannot be undone and will remove all module items.`,
            confirmText: 'Delete Module',
            variant: 'destructive',
            onConfirm: () => {
                setProcessingActions((prev) => ({ ...prev, [moduleId]: true }));
                router.delete(`/courses/${course.id}/modules/${moduleId}`, {
                    onSuccess: () => {
                        // showSuccess(`Module "${moduleTitle}" deleted successfully.`);
                        setLocalModules((prevModules) => prevModules.filter((m) => m.id !== moduleId));
                    },
                    onFinish: () => {
                        setProcessingActions((prev) => ({ ...prev, [moduleId]: false }));
                    },
                });
            },
        });
    };

    // New handler for bulk delete
    const handleBulkDelete = () => {
        confirm({
            title: 'Delete Selected Modules',
            description: `Are you sure you want to delete ${selectedModuleIds.size} selected modules? This action cannot be undone and will remove all their module items.`,
            confirmText: 'Delete Selected',
            variant: 'destructive',
            onConfirm: () => {
                router.post(`/admin/courses/${course.id}/modules/bulk-delete`, { // Use router.post for bulk delete
                    module_ids: Array.from(selectedModuleIds),
                }, {
                    onSuccess: () => {
                        // showSuccess(`Successfully deleted ${selectedModuleIds.size} modules.`);
                        setLocalModules((prevModules) =>
                            prevModules.filter((m) => !selectedModuleIds.has(m.id))
                        );
                        setSelectedModuleIds(new Set()); // Clear selection
                    },
                    onError: () => {
                        // showError('Failed to bulk delete modules. Please try again.');
                    },
                });
            },
        });
    };

    const handleDuplicate = (moduleId: number, moduleTitle: string) => {
        setProcessingActions((prev) => ({ ...prev, [moduleId]: true }));
        router.post(
            `/courses/${course.id}/modules/${moduleId}/duplicate`,
            {},
            {
                onSuccess: () => {
                    // showSuccess(`Module "${moduleTitle}" duplicated successfully.`);
                    // Fetch modules again to get the duplicated one, or add it manually if the backend returns it
                    router.reload({ only: ['modules'] }); // This will refetch modules from backend
                },
                onError: () => {
                    // showError(`Failed to duplicate module "${moduleTitle}". Please try again.`);
                },
                onFinish: () => {
                    setProcessingActions((prev) => ({ ...prev, [moduleId]: false }));
                },
            },
        );
    };

    const handleDragStart = (e: React.DragEvent, moduleId: number) => {
        setDraggedModule(moduleId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetModuleId: number) => {
        e.preventDefault();

        if (!draggedModule || draggedModule === targetModuleId) {
            setDraggedModule(null);
            return;
        }

        const draggedIndex = localModules.findIndex((m) => m.id === draggedModule); // Use localModules
        const targetIndex = localModules.findIndex((m) => m.id === targetModuleId); // Use localModules

        if (draggedIndex === -1 || targetIndex === -1) return;

        const reorderedModules = [...localModules]; // Use localModules
        const [draggedItem] = reorderedModules.splice(draggedIndex, 1);
        reorderedModules.splice(targetIndex, 0, draggedItem);

        const modulesWithNewOrder = reorderedModules.map((module, index) => ({
            id: module.id,
            order: index + 1,
        }));

        router.patch(`/courses/${course.id}/modules/order`, {
            modules: modulesWithNewOrder,
        }, {
            onSuccess: () => {
                //showSuccess('Module order updated successfully!');
                setLocalModules(reorderedModules.map((m, index) => ({ ...m, order: index + 1 }))); // Update local state
            },
            onFinish: () => {
                setDraggedModule(null);
            },
        });
    };

    const handleItemDragStart = (e: React.DragEvent, itemId: number) => {
        setDraggedItem(itemId);
        e.dataTransfer.effectAllowed = 'move';
        e.stopPropagation();
    };

    const handleItemDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleItemDrop = (e: React.DragEvent, moduleId: number, targetItemId: number) => {
        e.preventDefault();
        e.stopPropagation();

        if (!draggedItem || draggedItem === targetItemId) {
            setDraggedItem(null);
            return;
        }

        const currentModule = localModules.find((m) => m.id === moduleId); // Use localModules
        if (!currentModule || !currentModule.module_items) {
            setDraggedItem(null);
            return;
        }

        const reorderedItems = [...currentModule.module_items];
        const draggedIndex = reorderedItems.findIndex((item) => item.id === draggedItem);
        const targetIndex = reorderedItems.findIndex((item) => item.id === targetItemId);

        if (draggedIndex === -1 || targetIndex === -1) {
            setDraggedItem(null);
            return;
        }

        const [draggedItemData] = reorderedItems.splice(draggedIndex, 1);
        reorderedItems.splice(targetIndex, 0, draggedItemData);

        const itemsWithNewOrder = reorderedItems.map((item, index) => ({
            id: item.id,
            order: index + 1,
        }));

        router.patch(`/courses/${course.id}/modules/${moduleId}/items/order`, {
            items: itemsWithNewOrder,
        }, {
            onSuccess: () => {
                // showSuccess('Module item order updated successfully!');
                // Manually update module items in the local state to reflect the new order immediately
                setLocalModules((prevModules) =>
                    prevModules.map((m) =>
                        m.id === moduleId
                            ? { ...m, module_items: reorderedItems.map((item, index) => ({ ...item, order: index + 1 })) }
                            : m
                    )
                );
            },
            onError: () => {
                // showError('Failed to update module item order. Please try again.');
            },
            onFinish: () => {
                setDraggedItem(null);
            },
        });
    };

    const handleToggleModuleExpand = (moduleId: number) => {
        setExpandedModules((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(moduleId)) {
                newSet.delete(moduleId);
            } else {
                newSet.add(moduleId);
            }
            return newSet;
        });
    };

    const handleSelectModule = (moduleId: number, isSelected: boolean) => {
        setSelectedModuleIds((prev) => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(moduleId);
            } else {
                newSet.delete(moduleId);
            }
            return newSet;
        });
    };

    const handleSelectAllModules = (isSelected: boolean) => {
        if (isSelected) {
            setSelectedModuleIds(new Set(filteredModules.map((module) => module.id)));
        } else {
            setSelectedModuleIds(new Set());
        }
    };

    // Filter modules based on search and status
    const filteredModules = visibleModules.filter((module) => {
        const matchesSearch =
            module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus =
            statusFilter === 'all' || (statusFilter === 'published' && module.is_published) || (statusFilter === 'draft' && !module.is_published);
        return matchesSearch && matchesStatus;
    });

    const isAllModulesSelected = selectedModuleIds.size === filteredModules.length && filteredModules.length > 0;

    const totalItems = visibleModules.reduce((total, module) => {
        const itemsCount = module.module_items?.length || module.moduleItems?.length || module.items?.length || 0;
        return total + itemsCount;
    }, 0);
    const publishedModules = visibleModules.filter((m) => m.is_published).length;
    const draftModules = visibleModules.filter((m) => !m.is_published).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${course.name} - Modules`} />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/courses/${course.id}`}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Course
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Course Modules</h1>
                            <p className="text-lg text-muted-foreground">Manage learning content for {course.name}</p>
                        </div>
                    </div>

                    {isInstructor && (
                        <Button size="lg" asChild>
                            <Link href={`/courses/${course.id}/modules/create`}>
                                <Plus className="mr-2 h-5 w-5" />
                                Add Module
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Course Overview Stats */}
                <div className={`grid grid-cols-1 md:grid-cols-${isStudent ? '3' : '4'} gap-6`}>
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                                    <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Modules</p>
                                    <p className="text-3xl font-bold">{visibleModules.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    {!isStudent && (
                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900">
                                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Published</p>
                                        <p className="text-3xl font-bold">{publishedModules}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {!isStudent && (
                        <Card className="border-l-4 border-l-orange-500">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900">
                                        <XCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Draft</p>
                                        <p className="text-3xl font-bold">{draftModules}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    <Card className="border-l-4 border-l-purple-500">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                                    <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                                    <p className="text-3xl font-bold">{totalItems}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center gap-4 rounded-lg border bg-card p-4">
                    <div className="relative w-full flex-1">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                            placeholder="Search modules by title or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    {!isStudent && (
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'published' | 'draft')}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-ring"
                            >
                                <option value="all">All Modules ({visibleModules.length})</option>
                                <option value="published">Published ({publishedModules})</option>
                                <option value="draft">Draft ({draftModules})</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Bulk Actions Bar */}
                {isInstructor && selectedModuleIds.size > 0 && (
                    <div className="flex items-center justify-between rounded-lg border bg-card p-4">
                        <span className="text-sm text-muted-foreground">
                            {selectedModuleIds.size} module(s) selected
                        </span>
                        <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Selected ({selectedModuleIds.size})
                        </Button>
                    </div>
                )}

                {/* Modules List */}
                {filteredModules.length > 0 ? (
                    <div className="space-y-4">
                        {isInstructor && (
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="selectAllModules"
                                    checked={isAllModulesSelected}
                                    onCheckedChange={handleSelectAllModules}
                                />
                                <Label htmlFor="selectAllModules" className="cursor-pointer">
                                    Select All Modules
                                </Label>
                            </div>
                        )}
                        {filteredModules.map((module) => (
                            <Collapsible
                                key={module.id}
                                open={expandedModules.has(module.id)}
                                onOpenChange={() => handleToggleModuleExpand(module.id)}
                                className="space-y-2"
                            >
                                <Card
                                    className={`transition-all duration-200 hover:shadow-lg ${draggedModule === module.id ? 'scale-95 opacity-50' : ''}`}
                                    draggable={isInstructor}
                                    onDragStart={(e) => handleDragStart(e, module.id)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, module.id)}
                                >
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {isInstructor && (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div>
                                                                <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground transition-colors hover:text-foreground" />
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Drag to reorder modules</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                )}
                                                {isInstructor && (
                                                    <Checkbox
                                                        checked={selectedModuleIds.has(module.id)}
                                                        onCheckedChange={(checked) => handleSelectModule(module.id, Boolean(checked))}
                                                    />
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="text-sm font-medium">
                                                        Module {module.order}
                                                    </Badge>
                                                    <CardTitle className="text-xl">{module.title}</CardTitle>
                                                    {!isStudent &&
                                                        (module.is_published ? (
                                                            <Badge variant="default" className="text-sm">
                                                                <CheckCircle className="mr-1 h-3 w-3" />
                                                                Published
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="text-sm">
                                                                <XCircle className="mr-1 h-3 w-3" />
                                                                Draft
                                                            </Badge>
                                                        ))}
                                                </div>
                                                {isInstructor && module.module_items && module.module_items.length > 0 && (
                                                    <CollapsibleTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="ml-2">
                                                            {expandedModules.has(module.id) ? (
                                                                <ChevronUp className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronDown className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                )}
                                            </div>

                                            {isInstructor && (
                                                <div className="flex items-center gap-1">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <LoadingButton
                                                                variant="ghost"
                                                                size="sm"
                                                                loading={processingActions[module.id]}
                                                                onClick={() => handleTogglePublished(module.id, module.title, module.is_published)}
                                                                className="hover:bg-muted"
                                                            >
                                                                {module.is_published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </LoadingButton>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{module.is_published ? 'Unpublish module' : 'Publish module'}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/courses/${course.id}/modules/${module.id}/edit`}>
                                                                    <Edit className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Edit module</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <LoadingButton
                                                                variant="ghost"
                                                                size="sm"
                                                                loading={processingActions[module.id]}
                                                                onClick={() => handleDuplicate(module.id, module.title)}
                                                                className="hover:bg-muted"
                                                            >
                                                                <Copy className="h-4 w-4" />
                                                            </LoadingButton>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Duplicate module</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <LoadingButton
                                                                variant="ghost"
                                                                size="sm"
                                                                loading={processingActions[module.id]}
                                                                onClick={() => handleDelete(module.id, module.title)}
                                                                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </LoadingButton>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Delete module</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </div>

                                        {module.description && <CardDescription className="mt-3 text-base">{module.description}</CardDescription>}
                                    </CardHeader>

                                    <CardContent className="pt-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4" />
                                                    {module.module_items_count || module.itemsCount || 0} items
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Est. {Math.max(1, Math.ceil(((module.module_items_count || module.itemsCount || 0) * 15) / 60))}h
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Created {new Date(module.created_at).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/courses/${course.id}/modules/${module.id}`}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Module
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                                <CollapsibleContent>
                                    <div className="ml-8 space-y-2 border-l-2 pl-4">
                                        {module.module_items && module.module_items.length > 0 ? (
                                            module.module_items.sort((a, b) => a.order - b.order).map((item) => (
                                                <Card
                                                    key={item.id}
                                                    className={`bg-muted/50 ${draggedItem === item.id ? 'scale-95 opacity-50' : ''}`}
                                                    draggable={isInstructor}
                                                    onDragStart={(e) => handleItemDragStart(e, item.id)}
                                                    onDragOver={(e) => handleItemDragOver(e)}
                                                    onDrop={(e) => handleItemDrop(e, module.id, item.id)}
                                                >
                                                    <CardContent className="flex items-center justify-between p-4">
                                                        <div className="flex items-center gap-3">
                                                            {isInstructor && (
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <div>
                                                                            <GripVertical className="h-5 w-5 cursor-grab text-muted-foreground transition-colors hover:text-foreground" />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Drag to reorder module item</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            )}
                                                            {/* Icon based on itemable_type */}
                                                            {item.itemable_type === 'App\\Models\\Lecture' && <BookOpen className="h-5 w-5 text-blue-500" />}
                                                            {item.itemable_type === 'App\\Models\\Assessment' && <CheckSquare className="h-5 w-5 text-green-500" />}
                                                            {item.itemable_type === 'App\\Models\\Assignment' && <ClipboardList className="h-5 w-5 text-purple-500" />}
                                                            <span className="font-medium">{item.title}</span>
                                                            <Badge variant="outline" className="text-xs">
                                                                {item.itemable_type.split('\\').pop()}
                                                            </Badge>
                                                        </div>
                                                        {isInstructor && (
                                                            <div className="flex items-center gap-1">
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button variant="ghost" size="sm" asChild>
                                                                            <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}/edit`}>
                                                                                <Edit className="h-4 w-4" />
                                                                            </Link>
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Edit item</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <LoadingButton
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            loading={processingActions[item.id]}
                                                                            onClick={() => confirm({
                                                                                title: 'Delete Module Item',
                                                                                description: `Are you sure you want to delete "${item.title}"? This action cannot be undone.`,
                                                                                confirmText: 'Delete Module Item',
                                                                                variant: 'destructive',
                                                                                onConfirm: () => {
                                                                                    setProcessingActions((prev) => ({ ...prev, [item.id]: true }));
                                                                                    router.delete(`/courses/${course.id}/modules/${module.id}/items/${item.id}`, {
                                                                                        onFinish: () => {
                                                                                            setProcessingActions((prev) => ({ ...prev, [item.id]: false }));
                                                                                        },
                                                                                    });
                                                                                },
                                                                            })}
                                                                            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </LoadingButton>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>
                                                                        <p>Delete item</p>
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            </div>
                                                        )}
                                                        {!isInstructor && (
                                                            <Button variant="outline" size="sm" asChild>
                                                                <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}`}>
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View
                                                                </Link>
                                                            </Button>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground italic">No items in this module yet.</p>
                                        )}
                                    </div>
                                </CollapsibleContent>
                            </Collapsible>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <BookOpen className="mb-6 h-16 w-16 text-muted-foreground" />
                            <h3 className="mb-3 text-xl font-semibold">
                                {searchTerm || statusFilter !== 'all' ? 'No modules match your criteria' : 'No modules yet'}
                            </h3>
                            <p className="mb-6 max-w-md text-center text-muted-foreground">
                                {searchTerm || statusFilter !== 'all'
                                    ? "Try adjusting your search terms or filters to find what you're looking for."
                                    : isInstructor
                                      ? 'Start building your course by creating the first module. Modules help organize your content into logical learning units.'
                                      : "This course doesn't have any modules yet. Check back later for content."}
                            </p>
                            {isInstructor && !searchTerm && statusFilter === 'all' && (
                                <Button size="lg" asChild>
                                    <Link href={`/courses/${course.id}/modules/create`}>
                                        <Plus className="mr-2 h-5 w-5" />
                                        Create First Module
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

export default Index;
