import AppLayout from '@/layouts/app-layout';
import { CourseModuleItemShowPageProps, Lecture, Assessment, Assignment } from '@/types';
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
    HelpCircle,
    ClipboardList,
    Download,
    ExternalLink,
    Clock,
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

    // Helper function to get item type from polymorphic relationship
    const getItemType = (): 'lecture' | 'assessment' | 'assignment' | 'unknown' => {
        if (item.item_type_name) return item.item_type_name;

        if (item.itemable_type?.includes('Lecture')) return 'lecture';
        if (item.itemable_type?.includes('Assessment')) return 'assessment';
        if (item.itemable_type?.includes('Assignment')) return 'assignment';

        return 'unknown';
    };

    const itemType = getItemType();

    const getItemIcon = (type: string) => {
        switch (type) {
            case 'lecture':
                return <Play className="h-5 w-5 text-blue-500" />;
            case 'assessment':
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
        if (!item.itemable) {
            return (
                <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Content not available</p>
                </div>
            );
        }

        switch (itemType) {
            case 'lecture': {
                const lecture = item.itemable as Lecture;

                // Handle YouTube videos
                if (lecture.video_url || lecture.youtube_id) {
                    const videoUrl = lecture.video_url;
                    const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) :
                        lecture.youtube_id ? `https://www.youtube.com/embed/${lecture.youtube_id}` : null;

                    if (embedUrl) {
                        return (
                            <div className="space-y-4">
                                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                    <iframe
                                        src={embedUrl}
                                        title={lecture.title}
                                        className="w-full h-full"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                </div>
                                {lecture.video_url && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <ExternalLink className="h-4 w-4" />
                                        <a
                                            href={lecture.video_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-primary"
                                        >
                                            Watch on YouTube
                                        </a>
                                    </div>
                                )}
                                {lecture.content && (
                                    <div className="prose max-w-none mt-6">
                                        <h3>Lecture Notes</h3>
                                        <div className="whitespace-pre-wrap">{lecture.content}</div>
                                    </div>
                                )}
                            </div>
                        );
                    }
                }

                // Handle lecture content without video
                return (
                    <div className="space-y-4">
                        {lecture.content ? (
                            <div className="prose max-w-none">
                                <div className="whitespace-pre-wrap">{lecture.content}</div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    {lecture.video_url ? (
                                        <a
                                            href={lecture.video_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:underline"
                                        >
                                            Open Video Link
                                        </a>
                                    ) : (
                                        'No content provided for this lecture'
                                    )}
                                </p>
                            </div>
                        )}
                    </div>
                );
            }

            case 'assessment': {
                const assessment = item.itemable as Assessment;
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <HelpCircle className="h-5 w-5 text-blue-600" />
                                <h3 className="font-semibold text-blue-800">
                                    {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)} Assessment
                                </h3>
                            </div>
                            <div className="text-sm text-blue-700 space-y-1">
                                {assessment.max_score && (
                                    <p>Max Score: {assessment.max_score} points</p>
                                )}
                                {assessment.duration && (
                                    <p>Duration: {formatDuration(assessment.duration)}</p>
                                )}
                                <p>Status: {assessment.visibility}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button className="flex-1">
                                <HelpCircle className="mr-2 h-4 w-4" />
                                Start Assessment
                            </Button>
                            {assessment.files && assessment.files.length > 0 && (
                                <Button variant="outline">
                                    <Download className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                );
            }

            case 'assignment': {
                const assignment = item.itemable as Assignment;
                const isOpen = assignment.status === 'open';
                const isEnded = assignment.status === 'ended';

                return (
                    <div className="space-y-4">
                        <div className={`border rounded-lg p-4 ${
                            isOpen ? 'bg-green-50 border-green-200' :
                            isEnded ? 'bg-red-50 border-red-200' :
                            'bg-yellow-50 border-yellow-200'
                        }`}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <ClipboardList className={`h-5 w-5 ${
                                        isOpen ? 'text-green-600' :
                                        isEnded ? 'text-red-600' :
                                        'text-yellow-600'
                                    }`} />
                                    <h3 className={`font-semibold ${
                                        isOpen ? 'text-green-800' :
                                        isEnded ? 'text-red-800' :
                                        'text-yellow-800'
                                    }`}>
                                        Assignment
                                    </h3>
                                </div>
                                <Badge variant={
                                    isOpen ? 'default' :
                                    isEnded ? 'destructive' :
                                    'secondary'
                                }>
                                    {assignment.status.replace('-', ' ')}
                                </Badge>
                            </div>
                            <div className={`text-sm space-y-1 ${
                                isOpen ? 'text-green-700' :
                                isEnded ? 'text-red-700' :
                                'text-yellow-700'
                            }`}>
                                {assignment.total_points && (
                                    <p>Points: {assignment.total_points}</p>
                                )}
                                {assignment.expired_at && (
                                    <p>Due: {new Date(assignment.expired_at).toLocaleDateString()}</p>
                                )}
                            </div>
                        </div>

                        {isOpen && (
                            <Button className="w-full">
                                <ClipboardList className="mr-2 h-4 w-4" />
                                Submit Assignment
                            </Button>
                        )}
                    </div>
                );
            }

            default:
                return (
                    <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Content type not supported</p>
                    </div>
                );
        }
    };

    return (
        <AppLayout>
            <Head title={`${item.title} - ${module.title} - ${course.name}`} />

            <div className="container mx-auto px-4 py-6">
                <NavigationBreadcrumb items={navigationItems} />

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                {getItemIcon(itemType)}
                                <h1 className="text-2xl font-bold">{item.title}</h1>
                                {item.is_required && (
                                    <Badge variant="destructive" className="text-xs">
                                        Required
                                    </Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground">
                                {itemType.charAt(0).toUpperCase() + itemType.slice(1)} • Item {currentIndex + 1} of {items.length} in {module.title}
                            </p>
                        </div>
                    </div>

                    {isInstructor && (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/courses/${course.id}/modules/${module.id}/items/${item.id}/edit`}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            {getItemIcon(itemType)}
                                            {item.title}
                                        </CardTitle>
                                        {item.description && (
                                            <CardDescription className="mt-2">
                                                {item.description}
                                            </CardDescription>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        {itemType === 'lecture' && item.itemable && (item.itemable as Lecture).duration && (
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                {formatDuration((item.itemable as Lecture).duration)}
                                            </div>
                                        )}
                                        {item.view_count && item.view_count > 0 && (
                                            <div className="flex items-center gap-1">
                                                <span>{item.view_count} views</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {renderContent()}
                            </CardContent>
                        </Card>

                        {/* Previous/Next Navigation */}
                        <div className="flex justify-between mt-6">
                            {previousItem ? (
                                <Button variant="outline" asChild>
                                    <Link href={`/courses/${course.id}/modules/${module.id}/items/${previousItem.id}`}>
                                        <ChevronLeft className="mr-2 h-4 w-4" />
                                        Previous: {previousItem.title}
                                    </Link>
                                </Button>
                            ) : (
                                <div />
                            )}

                            {nextItem ? (
                                <Button asChild>
                                    <Link href={`/courses/${course.id}/modules/${module.id}/items/${nextItem.id}`}>
                                        Next: {nextItem.title}
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            ) : (
                                <div />
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <ModuleNavigation
                            course={course}
                            module={module}
                            currentItem={item}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default Show;
