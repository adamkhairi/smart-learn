import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseModulesPageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    Users,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

interface ModulesIndexProps extends CourseModulesPageProps {
    //
}

function Index({ course, modules }: ModulesIndexProps) {
    const [draggedModule, setDraggedModule] = useState<number | null>(null);

    const { patch } = useForm();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: '/courses' },
        { title: course.name, href: `/courses/${course.id}` },
        { title: 'Modules', href: '#' },
    ];

    const isInstructor = true; // This should come from auth context/props

    const handleTogglePublished = (moduleId: number) => {
        patch(`/courses/${course.id}/modules/${moduleId}/toggle-published`);
    };

    const handleDelete = (moduleId: number, moduleTitle: string) => {
        if (confirm(`Are you sure you want to delete the module "${moduleTitle}"? This action cannot be undone.`)) {
            router.delete(`/courses/${course.id}/modules/${moduleId}`);
        }
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${course.name} - Modules`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
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
                            <h1 className="text-2xl font-bold">Course Modules</h1>
                            <p className="text-muted-foreground">
                                Manage the learning modules for {course.name}
                            </p>
                        </div>
                    </div>

                    {isInstructor && (
                        <Button asChild>
                            <Link href={`/courses/${course.id}/modules/create`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Module
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Course Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">Total Modules</span>
                            </div>
                            <p className="text-2xl font-bold">{modules.length}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm font-medium">Published</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {modules.filter(m => m.is_published).length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <XCircle className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium">Draft</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {modules.filter(m => !m.is_published).length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-purple-500" />
                                <span className="text-sm font-medium">Total Items</span>
                            </div>
                            <p className="text-2xl font-bold">
                                {modules.reduce((total, module) => total + (module.itemsCount || 0), 0)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Modules List */}
                {modules.length > 0 ? (
                    <div className="space-y-4">
                        {modules.map((module, index) => (
                            <Card
                                key={module.id}
                                className={`transition-all duration-200 ${
                                    draggedModule === module.id ? 'opacity-50 scale-95' : ''
                                }`}
                                draggable={isInstructor}
                                onDragStart={(e) => handleDragStart(e, module.id)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, module.id)}
                            >
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {isInstructor && (
                                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                            )}
                                            <Badge variant="outline" className="text-xs">
                                                Module {module.order}
                                            </Badge>
                                            <CardTitle className="text-lg">{module.title}</CardTitle>
                                            <div className="flex items-center gap-2">
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
                                        </div>

                                        {isInstructor && (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleTogglePublished(module.id)}
                                                >
                                                    {module.is_published ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </Button>
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link href={`/courses/${course.id}/modules/${module.id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.post(`/courses/${course.id}/modules/${module.id}/duplicate`)}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(module.id, module.title)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {module.description && (
                                        <CardDescription className="mt-2">
                                            {module.description}
                                        </CardDescription>
                                    )}
                                </CardHeader>

                                <CardContent className="pt-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span>{module.itemsCount || 0} items</span>
                                            <span>•</span>
                                            <span>Created {new Date(module.created_at).toLocaleDateString()}</span>
                                        </div>

                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/courses/${course.id}/modules/${module.id}`}>
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
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No modules yet</h3>
                            <p className="text-muted-foreground text-center mb-4">
                                {isInstructor
                                    ? "Start building your course by creating the first module"
                                    : "This course doesn't have any modules yet."
                                }
                            </p>
                            {isInstructor && (
                                <Button asChild>
                                    <Link href={`/courses/${course.id}/modules/create`}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create First Module
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

export default Index;
