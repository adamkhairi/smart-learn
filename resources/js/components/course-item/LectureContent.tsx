import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ExternalLink, Play } from 'lucide-react';
import { Lecture } from '@/types';

interface LectureContentProps {
    lecture: Lecture;
    isCompleted: boolean;
    isInstructor: boolean;
    onMarkComplete: () => void;
    className?: string;
}

export default function LectureContent({
    lecture,
    isCompleted,
    isInstructor,
    onMarkComplete,
    className = ""
}: LectureContentProps) {
    const getDisplayableContent = (contentData: {
        content_html?: string;
        content_json?: string | object;
        content?: string
    }): string => {
        if (contentData.content_html) {
            return contentData.content_html;
        }

        if (contentData.content_json) {
            // Handle JSON content - this would need proper implementation based on your JSON structure
            return typeof contentData.content_json === 'string'
                ? contentData.content_json
                : JSON.stringify(contentData.content_json);
        }

        if (contentData.content) {
            return contentData.content;
        }

        return '';
    };

    const getYouTubeEmbedUrl = (url: string) => {
        const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
        return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    };

    const videoUrl = lecture.video_url ?? lecture.youtube_id;
    const embedUrl = videoUrl ? getYouTubeEmbedUrl(videoUrl) : null;
    const displayContent = getDisplayableContent({
        content_html: lecture.content_html,
        content_json: lecture.content_json,
        content: lecture.content,
    });

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Video Section */}
            {embedUrl ? (
                <div className="space-y-4">
                    <div className="aspect-video w-full overflow-hidden rounded-lg bg-muted shadow-lg">
                        <iframe
                            src={embedUrl}
                            title={lecture.title}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ExternalLink className="h-4 w-4" />
                        <a
                            href={videoUrl!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors underline"
                        >
                            Watch on YouTube
                        </a>
                    </div>
                </div>
            ) : (
                !displayContent && (
                    <Card className="border-dashed">
                        <CardContent className="py-12 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                                <Play className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="mb-2 text-lg font-medium">No Video Content</h3>
                            <p className="text-muted-foreground">No video has been provided for this lecture.</p>
                        </CardContent>
                    </Card>
                )
            )}

            {/* Text Content Section */}
            {displayContent && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Play className="h-5 w-5 text-blue-500" />
                            Lecture Content
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <div
                                dangerouslySetInnerHTML={{ __html: displayContent }}
                                className="lecture-content"
                            />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Progress Section */}
            <div className="flex flex-col items-center gap-4">
                {/* Complete Button */}
                {!isInstructor && !isCompleted && (
                    <Button
                        onClick={onMarkComplete}
                        className="bg-blue-600 hover:bg-blue-700 transition-colors"
                        size="lg"
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Completed
                    </Button>
                )}

                {/* Completion Status */}
                {isCompleted && (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 px-6 py-3 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200 dark:border-green-800">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Lecture Completed</span>
                    </div>
                )}

                {/* Instructor Note */}
                {isInstructor && (
                    <div className="text-center text-sm text-muted-foreground">
                        <p>As an instructor, you can view the content but completion tracking is disabled.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
