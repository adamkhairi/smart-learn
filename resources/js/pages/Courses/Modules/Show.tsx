import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem, CourseModuleShowPageProps } from '@/types';
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
    Play,
    FileText,
    Link as LinkIcon,
    HelpCircle,
    ClipboardList,
    Clock,
    CheckCircle,
    XCircle,
    Download
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from '@inertiajs/react';

function Show({ course, module }: CourseModuleShowPageProps) {
    const [draggedItem, setDraggedItem] = useState<number | null>(null);

    const { patch } = useForm();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Courses', href: '/courses' },
        { title: course.name, href: `/courses/${course.id}` },
        { title: 'Modules', href: `/courses/${course.id}/modules` },
        { title: module.title, href: '#' },
    ];

    const isInstructor = true; // This should come from auth context/props

    const handleTogglePublished = () => {
        patch(`/courses/${course.id}/modules/${module.id}/toggle-published`);
    };

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete the module "${module.title}"? This action cannot be undone.`)) {
            router.delete(`/courses/${course.id}/modules/${module.id}`);
        }
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

        if (!draggedItem || draggedItem === targetItemId || !module.moduleItems) {
            setDraggedItem(null);
            return;
        }

        const draggedIndex = module.moduleItems.findIndex(item => item.id === draggedItem);
        const targetIndex = module.moduleItems.findIndex(item => item.id === targetItemId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        // Create new order array
        const reorderedItems = [...module.moduleItems];
        const [draggedItem_] = reorderedItems.splice(draggedIndex, 1);
        reorderedItems.splice(targetIndex, 0, draggedItem_);

        // Update order values
        const itemsWithNewOrder = reorderedItems.map((item, index) => ({
            id: item.id,
            order: index + 1
        }));

        // Send update to backend
        patch(`/courses/${course.id}/modules/${module.id}/items/order`, {
            items: itemsWithNewOrder
        });

        setDraggedItem(null);
    };

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <Play className="h-4 w-4 text-blue-500" />;
            case 'document':
                return <FileText className="h-4 w-4 text-green-500" />;
            case 'link':
                return <LinkIcon className="h-4 w-4 text-purple-500" />;
            case 'quiz':
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
                            <Button
                                variant="ghost"
                                size="sm"
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
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/courses/${course.id}/modules/${module.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Module
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.post(`/courses/${course.id}/modules/${module.id}/duplicate`)}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleDelete}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
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

                {module.moduleItems && module.moduleItems.length > 0 ? (
                    <div className="space-y-3">
                        {module.moduleItems.map((item, index) => (
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
                                                {getItemIcon(item.type)}
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
                                                    <span className="capitalize">{item.type}</span>
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
                                            {/* View/Access Button */}
                                            {item.type === 'document' && item.url && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a
                                                        href={`/storage/${item.url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}

                                            {(item.type === 'video' || item.type === 'link') && item.url && (
                                                <Button variant="ghost" size="sm" asChild>
                                                    <a
                                                        href={item.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Play className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}

                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}`}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>

                                            {isInstructor && (
                                                <>
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}/edit`}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => router.post(`/courses/${course.id}/modules/${module.id}/items/${item.id}/duplicate`)}
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                                                                router.delete(`/courses/${course.id}/modules/${module.id}/items/${item.id}`);
                                                            }
                                                        }}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
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
            </div>
        </AppLayout>
    );
}

export default Show;
