import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Assessment, Assignment, CourseModuleItem, Lecture } from '@/types';
import { AlertCircle, ClipboardList, Clock, ExternalLink, Eye, FileText, HelpCircle, Play } from 'lucide-react';
import { useState } from 'react';

interface ModuleItemPreviewProps {
    item: CourseModuleItem;
    courseId: number;
    moduleId: number;
    trigger?: React.ReactNode;
}

export function ModuleItemPreview({ item, courseId, moduleId, trigger }: ModuleItemPreviewProps) {
    const [open, setOpen] = useState(false);

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

    const getYouTubeEmbedUrl = (url: string) => {
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    const renderPreviewContent = () => {
        if (!item.itemable) {
            return (
                <div className="py-8 text-center">
                    <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">Preview not available</p>
                </div>
            );
        }

        switch (itemType) {
            case 'lecture': {
                const lecture = item.itemable as Lecture;

                // Handle YouTube videos
                if (lecture.video_url || lecture.youtube_id) {
                    const videoUrl = lecture.video_url;
                    const embedUrl = videoUrl
                        ? getYouTubeEmbedUrl(videoUrl)
                        : lecture.youtube_id
                          ? `https://www.youtube.com/embed/${lecture.youtube_id}`
                          : null;

                    if (embedUrl) {
                        return (
                            <div className="space-y-4">
                                <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
                                    <iframe
                                        src={embedUrl}
                                        title={lecture.title}
                                        className="h-full w-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                </div>
                                {lecture.video_url && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div>
                                                    <ExternalLink className="h-4 w-4" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>External link</p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <a href={lecture.video_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                                            Watch on YouTube
                                        </a>
                                    </div>
                                )}
                            </div>
                        );
                    }
                }

                // Handle lecture content or no content
                return (
                    <div className="space-y-4">
                        {lecture.content ? (
                            <div className="prose max-w-none">
                                <div className="line-clamp-4 text-sm whitespace-pre-wrap">{lecture.content}</div>
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <Play className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                                <p className="text-muted-foreground">{lecture.description || item.description || 'No preview available'}</p>
                            </div>
                        )}
                    </div>
                );
            }

            case 'assessment': {
                const assessment = item.itemable as Assessment;
                return (
                    <div className="space-y-4">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <div className="mb-2 flex items-center gap-3">
                                <HelpCircle className="h-5 w-5 text-blue-600" />
                                <h3 className="font-semibold text-blue-800">
                                    {assessment.type.charAt(0).toUpperCase() + assessment.type.slice(1)} Assessment
                                </h3>
                            </div>
                            <div className="space-y-1 text-sm text-blue-700">
                                {assessment.max_score && <p>Max Score: {assessment.max_score} points</p>}
                                {assessment.duration && <p>Duration: {formatDuration(assessment.duration)}</p>}
                                <p>Status: {assessment.visibility}</p>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description || 'Click to start this assessment'}</p>
                    </div>
                );
            }

            case 'assignment': {
                const assignment = item.itemable as Assignment;
                const isOpen = assignment.status === 'open';
                const isEnded = assignment.status === 'ended';

                return (
                    <div className="space-y-4">
                        <div
                            className={`rounded-lg border p-4 ${
                                isOpen ? 'border-green-200 bg-green-50' : isEnded ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                            }`}
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <ClipboardList
                                        className={`h-5 w-5 ${isOpen ? 'text-green-600' : isEnded ? 'text-red-600' : 'text-yellow-600'}`}
                                    />
                                    <h3 className={`font-semibold ${isOpen ? 'text-green-800' : isEnded ? 'text-red-800' : 'text-yellow-800'}`}>
                                        Assignment
                                    </h3>
                                </div>
                                <Badge variant={isOpen ? 'default' : isEnded ? 'destructive' : 'secondary'}>
                                    {assignment.status.replace('-', ' ')}
                                </Badge>
                            </div>
                            <div className={`space-y-1 text-sm ${isOpen ? 'text-green-700' : isEnded ? 'text-red-700' : 'text-yellow-700'}`}>
                                {assignment.total_points && <p>Points: {assignment.total_points}</p>}
                                {assignment.expired_at && <p>Due: {new Date(assignment.expired_at).toLocaleDateString()}</p>}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description || 'Click to view assignment details'}</p>
                    </div>
                );
            }

            default:
                return (
                    <div className="py-8 text-center">
                        <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">{item.description || 'Preview not available'}</p>
                    </div>
                );
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {getItemIcon(itemType)}
                        {item.title}
                        {item.is_required && (
                            <Badge variant="destructive" className="text-xs">
                                Required
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Item metadata */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="capitalize">{itemType}</span>
                        {item.duration && (
                            <>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDuration(item.duration)}
                                </div>
                            </>
                        )}
                        {item.view_count > 0 && (
                            <>
                                <span>•</span>
                                <span>{item.view_count} views</span>
                            </>
                        )}
                    </div>

                    {/* Content preview */}
                    {renderPreviewContent()}

                    {/* Action buttons */}
                    <div className="flex items-center justify-between border-t pt-4">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Close Preview
                        </Button>
                        <Button asChild>
                            <a href={`/courses/${courseId}/modules/${moduleId}/items/${item.id}`}>View Full Item</a>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
