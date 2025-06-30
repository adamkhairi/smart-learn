import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseModuleItem } from '@/types';
import {
    Play,
    FileText,
    Link as LinkIcon,
    HelpCircle,
    ClipboardList,
    Eye,
    ExternalLink,
    Download,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

interface ModuleItemPreviewProps {
    item: CourseModuleItem;
    courseId: number;
    moduleId: number;
    trigger?: React.ReactNode;
}

export function ModuleItemPreview({ item, courseId, moduleId, trigger }: ModuleItemPreviewProps) {
    const [open, setOpen] = useState(false);

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

    const getYouTubeEmbedUrl = (url: string) => {
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    const renderPreviewContent = () => {
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
                    <div className="space-y-4">
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground mb-4">Document preview</p>
                            {item.url && (
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
                            )}
                        </div>
                        {item.description && (
                            <div className="border-t pt-4">
                                <p className="text-sm text-muted-foreground mb-2">Description:</p>
                                <p className="text-sm">{item.description}</p>
                            </div>
                        )}
                    </div>
                );

            case 'link':
                return (
                    <div className="text-center py-8">
                        <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">External Resource</p>
                        {item.url && (
                            <>
                                <Button asChild className="mb-4">
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
                            </>
                        )}
                        {item.description && (
                            <div className="border-t pt-4 mt-4">
                                <p className="text-sm text-muted-foreground mb-2">Description:</p>
                                <p className="text-sm">{item.description}</p>
                            </div>
                        )}
                    </div>
                );

            case 'quiz':
            case 'assignment':
                return (
                    <div className="space-y-4">
                        {item.content ? (
                            <div className="prose max-w-none">
                                <div className="whitespace-pre-wrap text-sm">{item.content}</div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                {item.type === 'quiz' ? (
                                    <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                ) : (
                                    <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                )}
                                <p className="text-muted-foreground">
                                    {item.description || 'No preview available'}
                                </p>
                            </div>
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
                        <p className="text-muted-foreground">Preview not available</p>
                    </div>
                );
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        {getItemIcon(item.type)}
                        <span>{item.title}</span>
                        {item.is_required && (
                            <Badge variant="destructive" className="text-xs">
                                Required
                            </Badge>
                        )}
                    </DialogTitle>
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
                </DialogHeader>

                <div className="mt-4">
                    {renderPreviewContent()}
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                        Want to access all features?
                    </div>
                    <Button asChild>
                        <a href={`/courses/${courseId}/modules/${moduleId}/items/${item.id}`}>
                            View Full Item
                        </a>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
