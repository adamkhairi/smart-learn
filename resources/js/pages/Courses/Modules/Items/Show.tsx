import AppLayout from '@/layouts/app-layout';
import { CourseModuleItemShowPageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModuleNavigation } from '@/components/module-navigation';
import { NavigationBreadcrumb } from '@/components/navigation-breadcrumb';
import { useAuth } from '@/hooks/use-auth';
import {
    Edit,
    Play,
    FileText,
    Link as LinkIcon,
    HelpCircle,
    ClipboardList,
    Download,
    ExternalLink,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

function Show({ course, module, item }: CourseModuleItemShowPageProps) {
    const { canManageCourse } = useAuth();
    const isInstructor = canManageCourse(course.created_by);

    // Navigation items for breadcrumb
    const navigationItems = [
        { title: 'Courses', href: '/courses' },
        { title: course.name, href: `/courses/${course.id}` },
        { title: 'Modules', href: `/courses/${course.id}/modules` },
        { title: module.title, href: `/courses/${course.id}/modules/${module.id}` },
        { title: item.title, href: '#', isActive: true },
    ];

    // Find previous and next items for navigation
    const items = module.moduleItems || [];
    const currentIndex = items.findIndex(i => i.id === item.id);
    const previousItem = currentIndex > 0 ? items[currentIndex - 1] : null;
    const nextItem = currentIndex < items.length - 1 ? items[currentIndex + 1] : null;

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <Play className="h-5 w-5 text-blue-500" />;
            case 'document':
                return <FileText className="h-5 w-5 text-green-500" />;
            case 'link':
                return <LinkIcon className="h-5 w-5 text-purple-500" />;
            case 'quiz':
                return <HelpCircle className="h-5 w-5 text-orange-500" />;
            case 'assignment':
                return <ClipboardList className="h-5 w-5 text-red-500" />;
            default:
                return <FileText className="h-5 w-5" />;
        }
    };

    const formatDuration = (duration?: number) => {
        if (!duration) return null;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getYouTubeEmbedUrl = (url: string) => {
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    const renderContent = () => {
        switch (item.type) {
            case 'video':
                if (item.url) {
                    const embedUrl = getYouTubeEmbedUrl(item.url);
                    if (embedUrl) {
                        return (
                            <div className="space-y-4">
                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                    <iframe
                                        src={embedUrl}
                                        title={item.title}
                                        className="w-full h-full"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <ExternalLink className="h-4 w-4" />
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:text-primary"
                                    >
                                        Watch on YouTube
                                    </a>
                                </div>
                            </div>
                        );
                    }
                }
                return (
                    <div className="text-center py-8">
                        <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            {item.url ? (
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    Open Video Link
                                </a>
                            ) : (
                                'No video URL provided'
                            )}
                        </p>
                    </div>
                );

            case 'document':
                return (
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        {item.url ? (
                            <div className="space-y-4">
                                <p className="text-muted-foreground">
                                    Document available for download
                                </p>
                                <Button asChild>
                                    <a
                                        href={`/storage/${item.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Document
                                    </a>
                                </Button>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No document available</p>
                        )}
                    </div>
                );

            case 'link':
                return (
                    <div className="text-center py-8">
                        <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        {item.url ? (
                            <div className="space-y-4">
                                <p className="text-muted-foreground">
                                    External resource link
                                </p>
                                <Button asChild>
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Open Link
                                    </a>
                                </Button>
                                <p className="text-xs text-muted-foreground break-all">
                                    {item.url}
                                </p>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No link provided</p>
                        )}
                    </div>
                );

            case 'quiz':
            case 'assignment':
                return (
                    <div className="space-y-4">
                        {item.content ? (
                            <div className="prose max-w-none">
                                <div className="whitespace-pre-wrap">{item.content}</div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No content provided</p>
                        )}

                        {item.url && (
                            <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Additional Resource:
                                </p>
                                <Button variant="outline" size="sm" asChild>
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <ExternalLink className="mr-2 h-4 w-4" />
                                        Open Resource
                                    </a>
                                </Button>
                            </div>
                        )}
                    </div>
                );

            default:
                return (
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Content not available</p>
                    </div>
                );
        }
    };

    return (
        <AppLayout>
            <Head title={`${item.title} - ${module.title}`} />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Enhanced Breadcrumb Navigation */}
                <div className="flex items-center justify-between">
                    <NavigationBreadcrumb items={navigationItems} />
                    {isInstructor && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Item
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Header with Item Navigation */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                {getItemIcon(item.type)}
                                <h1 className="text-2xl font-bold">{item.title}</h1>
                                {item.is_required && (
                                    <Badge variant="destructive" className="text-xs">
                                        Required
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">
                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • Item {currentIndex + 1} of {items.length} in {module.title}
                            </p>
                        </div>
                    </div>

                    {/* Previous/Next Navigation */}
                    <div className="flex items-center gap-2">
                        {previousItem ? (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/courses/${course.id}/modules/${module.id}/items/${previousItem.id}`}>
                                    <ChevronLeft className="mr-2 h-4 w-4" />
                                    Previous
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="outline" size="sm" disabled>
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Previous
                            </Button>
                        )}

                        {nextItem ? (
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/courses/${course.id}/modules/${module.id}/items/${nextItem.id}`}>
                                    Next
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <Button variant="outline" size="sm" disabled>
                                Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        {getItemIcon(item.type)}
                                        {item.title}
                                    </CardTitle>

                                    {/* Item Metadata */}
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            {item.is_required ? (
                                                <>
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                    Required
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="h-3 w-3 text-orange-500" />
                                                    Optional
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {item.description && (
                                    <CardDescription>{item.description}</CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                {renderContent()}
                            </CardContent>
                        </Card>

                        {/* Navigation to Next/Previous Items */}
                        {(previousItem || nextItem) && (
                            <div className="flex justify-between gap-4 mt-6">
                                {previousItem ? (
                                    <Card className="flex-1 hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <Link
                                                href={`/courses/${course.id}/modules/${module.id}/items/${previousItem.id}`}
                                                className="block"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Previous</p>
                                                        <p className="font-medium text-sm">{previousItem.title}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="flex-1" />
                                )}

                                {nextItem ? (
                                    <Card className="flex-1 hover:shadow-md transition-shadow">
                                        <CardContent className="p-4">
                                            <Link
                                                href={`/courses/${course.id}/modules/${module.id}/items/${nextItem.id}`}
                                                className="block"
                                            >
                                                <div className="flex items-center gap-3 justify-end text-right">
                                                    <div>
                                                        <p className="text-xs text-muted-foreground">Next</p>
                                                        <p className="font-medium text-sm">{nextItem.title}</p>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="flex-1" />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Enhanced Sidebar Navigation */}
                    <div className="space-y-6">
                        <ModuleNavigation
                            course={course}
                            module={module}
                            currentItem={item}
                            completedItems={[]} // This would come from backend
                        />

                        {/* Item Details Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Item Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span>Type</span>
                                        <span className="capitalize">{item.type}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span>Position</span>
                                        <span>{currentIndex + 1} of {items.length}</span>
                                    </div>
                                </div>
                                {item.duration && (
                                    <div>
                                        <div className="flex justify-between text-sm">
                                            <span>Duration</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDuration(item.duration)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span>Required</span>
                                        <span className="flex items-center gap-1">
                                            {item.is_required ? (
                                                <>
                                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                                    Yes
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="h-3 w-3 text-orange-500" />
                                                    No
                                                </>
                                            )}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm">
                                        <span>Created</span>
                                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions for Instructors */}
                        {isInstructor && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button variant="outline" size="sm" asChild className="w-full justify-start">
                                        <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Item
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild className="w-full justify-start">
                                        <Link href={`/courses/${course.id}/modules/${module.id}/items/create`}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            Add New Item
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default Show;
