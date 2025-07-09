import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseModulesPageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
    BookOpen,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    FileText,
    Calendar
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

// Using CourseModulesPageProps directly since no additional props needed
type ModulesIndexProps = CourseModulesPageProps;

function Index({ course, modules }: ModulesIndexProps) {
    const [draggedModule, setDraggedModule] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [processingActions, setProcessingActions] = useState<Record<number, boolean>>({});

    const { patch } = useForm();
    const { canManageCourse } = useAuth();
    const { confirm, confirmDialog } = useConfirmDialog();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: '/courses' },
        { title: course.name, href: `/courses/${course.id}` },
        { title: 'Modules', href: '#' },
    ];

    const isInstructor = canManageCourse(course.created_by);
    const isStudent = !isInstructor; // If not instructor, assume student

    // Filter modules based on user role - students only see published modules
    const visibleModules = isStudent ? modules.filter(module => module.is_published) : modules;

    const handleTogglePublished = (moduleId: number) => {
        setProcessingActions(prev => ({ ...prev, [moduleId]: true }));
        patch(`/courses/${course.id}/modules/${moduleId}/toggle-published`, {
            onFinish: () => {
                setProcessingActions(prev => ({ ...prev, [moduleId]: false }));
            }
        });
    };

    const handleDelete = (moduleId: number, moduleTitle: string) => {
        confirm({
            title: 'Delete Module',
            description: `Are you sure you want to delete "${moduleTitle}"? This action cannot be undone and will remove all module items.`,
            confirmText: 'Delete Module',
            variant: 'destructive',
            onConfirm: () => {
                setProcessingActions(prev => ({ ...prev, [moduleId]: true }));
                router.delete(`/courses/${course.id}/modules/${moduleId}`, {
                    onFinish: () => {
                        setProcessingActions(prev => ({ ...prev, [moduleId]: false }));
                    }
                });
            }
        });
    };

    const handleDuplicate = (moduleId: number) => {
        setProcessingActions(prev => ({ ...prev, [moduleId]: true }));
        router.post(`/courses/${course.id}/modules/${moduleId}/duplicate`, {}, {
            onFinish: () => {
                setProcessingActions(prev => ({ ...prev, [moduleId]: false }));
            }
        });
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

        const draggedIndex = modules.findIndex(m => m.id === draggedModule);
        const targetIndex = modules.findIndex(m => m.id === targetModuleId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        // Create new order array
        const reorderedModules = [...modules];
        const [draggedItem] = reorderedModules.splice(draggedIndex, 1);
        reorderedModules.splice(targetIndex, 0, draggedItem);

        // Update order values
        const modulesWithNewOrder = reorderedModules.map((module, index) => ({
            id: module.id,
            order: index + 1
        }));

        // Send update to backend
        patch(`/courses/${course.id}/modules/order`, {
            modules: modulesWithNewOrder
        });

        setDraggedModule(null);
    };

    // Filter modules based on search and status
    const filteredModules = visibleModules.filter(module => {
        const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' ||
                            (statusFilter === 'published' && module.is_published) ||
                            (statusFilter === 'draft' && !module.is_published);
        return matchesSearch && matchesStatus;
    });

    const totalItems = visibleModules.reduce((total, module) =>
        total + (module.module_items_count || module.itemsCount || 0), 0
    );
    const publishedModules = visibleModules.filter(m => m.is_published).length;
    const draftModules = visibleModules.filter(m => !m.is_published).length;

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
                            <p className="text-muted-foreground text-lg">
                                Manage learning content for {course.name}
                            </p>
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
                                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
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
                                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
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
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
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
                                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
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
                <div className="flex items-center gap-4 bg-card border rounded-lg p-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                                className="border border-input bg-background px-3 py-2 text-sm rounded-md focus:ring-2 focus:ring-ring focus:border-transparent"
                            >
                                <option value="all">All Modules ({visibleModules.length})</option>
                                <option value="published">Published ({publishedModules})</option>
                                <option value="draft">Draft ({draftModules})</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Modules List */}
                {filteredModules.length > 0 ? (
                    <div className="space-y-4">
                        {filteredModules.map((module) => (
                            <Card
                                key={module.id}
                                className={`transition-all duration-200 hover:shadow-lg ${
                                    draggedModule === module.id ? 'opacity-50 scale-95' : ''
                                }`}
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
                                                            <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab hover:text-foreground transition-colors" />
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Drag to reorder modules</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className="text-sm font-medium">
                                                    Module {module.order}
                                                </Badge>
                                                <CardTitle className="text-xl">{module.title}</CardTitle>
                                                {!isStudent && (
                                                    module.is_published ? (
                                                        <Badge variant="default" className="text-sm">
                                                            <CheckCircle className="mr-1 h-3 w-3" />
                                                            Published
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-sm">
                                                            <XCircle className="mr-1 h-3 w-3" />
                                                            Draft
                                                        </Badge>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        {isInstructor && (
                                            <div className="flex items-center gap-1">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <LoadingButton
                                                            variant="ghost"
                                                            size="sm"
                                                            loading={processingActions[module.id]}
                                                            onClick={() => handleTogglePublished(module.id)}
                                                            className="hover:bg-muted"
                                                        >
                                                            {module.is_published ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
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
                                                            onClick={() => handleDuplicate(module.id)}
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
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
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

                                    {module.description && (
                                        <CardDescription className="text-base mt-3">
                                            {module.description}
                                        </CardDescription>
                                    )}
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
                                                Est. {Math.max(1, Math.ceil((module.module_items_count || module.itemsCount || 0) * 15 / 60))}h
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
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <BookOpen className="h-16 w-16 text-muted-foreground mb-6" />
                            <h3 className="text-xl font-semibold mb-3">
                                {searchTerm || statusFilter !== 'all' ? 'No modules match your criteria' : 'No modules yet'}
                            </h3>
                            <p className="text-muted-foreground text-center mb-6 max-w-md">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your search terms or filters to find what you\'re looking for.'
                                    : isInstructor
                                        ? "Start building your course by creating the first module. Modules help organize your content into logical learning units."
                                        : "This course doesn't have any modules yet. Check back later for content."
                                }
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
