import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import AppLayout from '@/layouts/app-layout';
import { Comment as CommentType, Course, Discussion, PageProps, User } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCommentPolling } from '@/hooks/use-comment-polling';
import { MessageSquare, User as UserIcon, Calendar, MessageCircle } from 'lucide-react';

// Recursive function to add a reply to a nested comment
const addReplyRecursive = (items: CommentType[], newComment: CommentType): CommentType[] => {
    return items.map((item) => {
        if (item.id === newComment.parent_id) {
            return { ...item, replies: [...(item.replies || []), newComment] };
        }
        if (item.replies && item.replies.length > 0) {
            return { ...item, replies: addReplyRecursive(item.replies, newComment) };
        }
        return item;
    });
};

// TODO: Add these functions back when real-time updates are implemented
// Recursive function to update a nested comment
// const updateCommentRecursive = (items: CommentType[], updatedComment: CommentType): CommentType[] => {
//     return items.map((item) => {
//         if (item.id === updatedComment.id) {
//             return { ...item, ...updatedComment, replies: updatedComment.replies || item.replies };
//         }
//         if (item.replies && item.replies.length > 0) {
//             return { ...item, replies: updateCommentRecursive(item.replies, updatedComment) };
//         }
//         return item;
//     });
// };

// Recursive function to delete a nested comment
// const deleteCommentRecursive = (items: CommentType[], commentId: number): CommentType[] => {
//     return items
//         .filter((item) => item.id !== commentId)
//         .map((item) => {
//             if (item.replies && item.replies.length > 0) {
//                 return { ...item, replies: deleteCommentRecursive(item.replies, commentId) };
//             }
//             return item;
//         });
// };

interface ShowPageProps extends PageProps {
    course: Course;
    discussion: Discussion & {
        user: User;
        comments: CommentType[];
    };
    comments: CommentType[];
    flash: {
        success?: string;
        error?: string;
    };
}

export default function Show() {
    const { course, discussion, comments: initialComments, auth } = usePage<ShowPageProps>().props;
    const [comments, setComments] = useState<CommentType[]>(initialComments);
    const isMobile = useIsMobile();

    // Flash messages are handled globally by useFlashToast hook in the layout
    // No need to handle them here to avoid duplicate notifications

    // Initialize polling with the highest comment ID
    useEffect(() => {
        if (initialComments.length > 0) {
            const maxId = Math.max(...initialComments.map(c => c.id));
            setLastCommentId(maxId);
        }
    }, [initialComments]);

    // Comment polling for real-time updates
    const { setLastCommentId, refreshNow } = useCommentPolling({
        discussionId: discussion.id,
        onNewComments: (newComments) => {
            setComments((currentComments) => {
                const updatedComments = [...currentComments];

                newComments.forEach((newComment) => {
                    // Check if comment already exists to prevent duplicates
                    const existingComment = updatedComments.find(c => c.id === newComment.id);
                    if (existingComment) return; // Skip if already exists

                    if (newComment.parent_id) {
                        // Add reply to existing comment
                        const parentComment = updatedComments.find(c => c.id === newComment.parent_id);
                        if (parentComment) {
                            if (!parentComment.replies) parentComment.replies = [];
                            // Check if reply already exists
                            const existingReply = parentComment.replies.find(r => r.id === newComment.id);
                            if (!existingReply) {
                                parentComment.replies.push(newComment);
                            }
                        }
                    } else {
                        // Add new top-level comment
                        updatedComments.push(newComment);
                    }
                });

                return updatedComments;
            });

            // Show notification for comments from other users
            newComments.forEach((newComment) => {
                if (newComment.user_id !== auth.user.id) {
                    toast.success('New comment received!');
                }
            });
        },
        onError: (error) => {
            console.error('Error polling comments:', error);
        },
        pollInterval: 30000, // 30 seconds
        enabled: true,
    });

    const handleCommentPosted = (newComment?: CommentType) => {
        // If we have a new comment from the form submission, add it immediately
        if (newComment) {
            setComments((currentComments) => {
                if (newComment.parent_id) {
                    return addReplyRecursive(currentComments, newComment);
                } else {
                    return [...currentComments, newComment];
                }
            });
        }
    };

    const breadcrumbs = [
        {
            title: 'Courses',
            href: '/courses',
        },
        {
            title: (course.title as string) || (course.name as string) || 'Course',
            href: route('courses.show', course.id),
        },
        {
            title: 'Discussions',
            href: route('courses.discussions.index', course.id),
        },
        {
            title: discussion.title as string,
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={discussion.title} />

            <div className="flex w-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 lg:gap-6 lg:p-6">
                {/* Page Header */}
                <PageHeader
                    title={discussion.title}
                    description={`Discussion in ${course.title || course.name || 'Course'}`}
                    backUrl={route('courses.discussions.index', course.id)}
                    backLabel={isMobile ? 'Back' : 'Back to Discussions'}
                    stats={[
                        {
                            label: 'Comments',
                            value: comments.length,
                            icon: <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4" />,
                        },
                        {
                            label: 'Author',
                            value: discussion.user.name,
                            icon: <UserIcon className="h-3 w-3 sm:h-4 sm:w-4" />,
                        },
                        {
                            label: 'Created',
                            value: new Date(discussion.created_at).toLocaleDateString(),
                            icon: <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />,
                        },
                    ]}
                />

                {/* Discussion Content */}
                <Card className="w-full">
                    <CardHeader>
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={discussion.user.photo} alt={discussion.user.name} />
                                <AvatarFallback>{discussion.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>
                                Posted by {discussion.user.name} on {new Date(discussion.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: discussion.content }} />
                    </CardContent>
                </Card>

                {/* Comments Section */}
                <div className="mt-8">
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold flex items-center gap-2">
                            <MessageSquare className="h-6 w-6" />
                            Comments ({comments.length})
                        </h3>
                        <p className="text-muted-foreground mt-1">
                            Join the conversation and share your thoughts
                        </p>
                    </div>

                    <CommentForm
                        discussionId={discussion.id}
                        onSuccess={handleCommentPosted}
                        onRefresh={refreshNow}
                    />

                    <div className="mt-8">
                        <CommentList
                            comments={comments}
                            discussionId={discussion.id}
                            courseId={course.id}
                            onRefresh={refreshNow}
                        />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
