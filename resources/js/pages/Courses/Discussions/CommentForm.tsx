import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Comment as CommentType } from '@/types';
import { MessageSquare, Send } from 'lucide-react';

type CommentFormProps = {
  discussionId: number;
  parentId?: number;
  initialBody?: string;
  onSuccess?: (comment?: CommentType) => void;
  onRefresh?: () => void;
  submitLabel?: string;
  placeholder?: string;
  className?: string;
};

const CommentForm: React.FC<CommentFormProps> = ({
  discussionId,
  parentId,
  initialBody = '',
  onSuccess,
  onRefresh,
  submitLabel = 'Post Comment',
  placeholder = 'Write your comment...',
  className = '',
}) => {
  const { data, setData, post, processing, errors, reset } = useForm({
    content: initialBody,
    parent_id: parentId,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(
      route('comments.store', { discussion: discussionId }),
      {
        preserveScroll: true,
        onSuccess: (page) => {
          setData('content', '');
          reset();
          // Check if there's a new comment in the flash data
          const flash = page.props.flash as { comment?: CommentType };
          if (flash?.comment && onSuccess) {
            onSuccess(flash.comment);
          }
          // Refresh comments to get updated data immediately
          onRefresh?.();
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (data.content.trim() && !processing) {
        post(
          route('comments.store', { discussion: discussionId }),
          {
            preserveScroll: true,
            onSuccess: (page) => {
              setData('content', '');
              reset();
              const flash = page.props.flash as { comment?: CommentType };
              if (flash?.comment && onSuccess) {
                onSuccess(flash.comment);
              }
              // Refresh comments to get updated data immediately
              onRefresh?.();
            },
          }
        );
      }
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          {parentId ? 'Reply to Comment' : 'Add a Comment'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textarea
              value={data.content}
              onChange={e => setData('content', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={4}
              className="resize-none"
              required
              disabled={processing}
            />
            {errors.content && (
              <p className="text-sm text-red-600 mt-2">{errors.content}</p>
            )}
          </div>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={processing || !data.content.trim()}
              className="min-w-[120px]"
            >
              {processing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {submitLabel}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CommentForm;
