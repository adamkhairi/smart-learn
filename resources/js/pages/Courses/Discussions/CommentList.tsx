import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Comment as CommentType, PageProps } from '@/types';
import { useForm, usePage } from '@inertiajs/react';
import { Edit, MoreHorizontal, Trash2, Reply, MessageSquare } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';
import { toast } from 'sonner';
import CommentForm from './CommentForm';

// Simple function to format relative time
const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

interface CommentListProps {
    comments: CommentType[];
    discussionId: number;
    courseId: number;
    onRefresh?: () => void;
}

interface CommentItemProps {
    comment: CommentType;
    discussionId: number;
    courseId: number;
    level?: number;
    onReplySuccess: () => void;
}

const CommentItem = ({ comment, discussionId, courseId, level = 0, onReplySuccess }: CommentItemProps) => {
    const { auth } = usePage<PageProps>().props;
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const {
        data,
        setData,
        patch,
        processing: isUpdating,
        errors,
        reset,
    } = useForm({
        content: comment.content,
    });

    const { delete: destroy } = useForm();

    const handleUpdateSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('comments.update', comment.id), {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditing(false);
                // Flash message will handle the success notification
                // Refresh comments to get updated data immediately
                onReplySuccess();
            },
            onError: (err) => {
                toast.error(err.content || 'Failed to update comment.');
            },
        });
    };

    const handleDelete = () => {
        destroy(route('comments.destroy', comment.id), {
            preserveScroll: true,
            onSuccess: () => {
                // Flash message will handle the success notification
                // Refresh comments to get updated data immediately
                onReplySuccess();
            },
            onError: () => toast.error('Failed to delete comment.'),
        });
    };

    const canModify = auth.user && (auth.user.id === comment.user_id || auth.user.role === 'admin');

    return (
        <div className={`space-y-4 ${level > 0 ? 'ml-4 border-l-2 border-gray-200 pl-4 sm:ml-8 sm:pl-6 dark:border-gray-700' : ''}`}>
            <Card className="transition-shadow hover:shadow-sm">
                <CardContent className="p-4">
                    <div className="flex space-x-3">
                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
                            <AvatarImage src={comment.user?.photo} alt={comment.user?.name} />
                            <AvatarFallback>{comment.user?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {comment.user?.name}
                                    </span>
                                    <span
                                        className="text-xs text-gray-500 dark:text-gray-400"
                                        title={new Date(comment.created_at).toLocaleString()}
                                    >
                                        {formatRelativeTime(comment.created_at)}
                                    </span>
                                </div>
                                {canModify && !isEditing && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setIsEditing(true)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onSelect={(e) => {
                                                    e.preventDefault();
                                                    setShowDeleteDialog(true);
                                                }}
                                                className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-900/40"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleUpdateSubmit} className="space-y-3">
                                    <Textarea
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        className="w-full"
                                        rows={3}
                                        autoFocus
                                    />
                                    {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
                                    <div className="flex items-center justify-end space-x-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => {
                                                setIsEditing(false);
                                                reset();
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isUpdating}>
                                            {isUpdating ? 'Saving...' : 'Save'}
                                        </Button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-3">
                                    <p className="text-sm whitespace-pre-wrap text-gray-800 dark:text-gray-300">
                                        {comment.content}
                                    </p>

                                    {!isEditing && (
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-auto p-0 text-xs font-semibold text-blue-600 hover:text-blue-700"
                                                onClick={() => setIsReplying(!isReplying)}
                                            >
                                                <Reply className="mr-1 h-3 w-3" />
                                                Reply
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isReplying && (
                                <div className="mt-4">
                                    <CommentForm
                                        discussionId={discussionId}
                                        parentId={comment.id}
                                        onSuccess={() => {
                                            setIsReplying(false);
                                            onReplySuccess();
                                        }}
                                        onRefresh={onReplySuccess}
                                        submitLabel="Post Reply"
                                        placeholder="Write your reply..."
                                        className="border-l-2 border-blue-200 bg-blue-50/50 dark:bg-blue-950/20"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {comment.replies && comment.replies.length > 0 && (
                <div className="space-y-4">
                    {comment.replies
                        .filter((reply, index, self) =>
                            index === self.findIndex(r => r.id === reply.id)
                        )
                        .map((reply) => (
                            <CommentItem
                                key={`${comment.id}-reply-${reply.id}`}
                                comment={reply}
                                discussionId={discussionId}
                                courseId={courseId}
                                level={level + 1}
                                onReplySuccess={onReplySuccess}
                            />
                        ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Delete Comment"
                description="Are you sure you want to delete this comment? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </div>
    );
};

export default function CommentList({ comments: initialComments, discussionId, courseId, onRefresh }: CommentListProps) {
    const [comments, setComments] = useState<CommentType[]>(initialComments);

    // Update comments when they change from parent component
    useEffect(() => {
        // Ensure unique comments by ID to prevent duplicates
        const uniqueComments = initialComments.filter((comment, index, self) =>
            index === self.findIndex(c => c.id === comment.id)
        );
        setComments(uniqueComments);
    }, [initialComments]);

    if (!initialComments || initialComments.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No comments yet</h3>
                    <p className="text-muted-foreground">
                        Be the first to share your thoughts on this discussion!
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {comments.map((comment) => (
                <CommentItem
                    key={`comment-${comment.id}`}
                    comment={comment}
                    discussionId={discussionId}
                    courseId={courseId}
                    onReplySuccess={() => {
                        // Refresh comments to get updated data
                        onRefresh?.();
                    }}
                />
            ))}
        </div>
    );
}
