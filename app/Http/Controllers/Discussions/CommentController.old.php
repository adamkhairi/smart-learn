<?php

namespace App\Http\Controllers\Discussions;

use App\Actions\Comments\CreateCommentAction;
use App\Actions\Comments\DeleteCommentAction;
use App\Actions\Comments\UpdateCommentAction;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Course;
use App\Models\Discussion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    /**
     * Get comments after a specific ID for polling.
     */
    public function getNewComments(Request $request, Discussion $discussion): JsonResponse
    {
        $afterId = $request->query('after', 0);

        $comments = Comment::where('commentable_type', Discussion::class)
            ->where('commentable_id', $discussion->id)
            ->where('id', '>', $afterId)
            ->with(['user', 'replies.user', 'likes'])
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'comments' => $comments,
            'count' => $comments->count(),
        ]);
    }

    /**
     * Store a newly created comment or reply.
     */
    public function store(
        Request $request,
        Course $course,
        Discussion $discussion,
        CreateCommentAction $createCommentAction
    ): RedirectResponse {
        $this->authorize('create', [Comment::class, $discussion]);

        $validator = Validator::make($request->input(), [
            'content' => 'required|string|max:2000',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        try {
            $comment = $createCommentAction->execute([
                'commentable_type' => Discussion::class,
                'commentable_id' => $discussion->id,
                'user_id' => Auth::id(),
                'content' => $validated['content'],
                'parent_id' => $validated['parent_id'] ?? null,
            ]);

            $comment->load('user', 'likes', 'replies');

            return back()->with([
                'success' => 'Comment posted successfully!',
                'comment' => $comment,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to create comment', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'discussion_id' => $discussion->id,
            ]);

            return back()->withErrors(['error' => 'Failed to post comment. Please try again.']);
        }
    }

    /**
     * Update an existing comment.
     */
    public function update(
        Request $request,
        Comment $comment,
        UpdateCommentAction $updateCommentAction
    ): RedirectResponse {
        $this->authorize('update', $comment);

        $validator = Validator::make($request->input(), [
            'content' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $validated = $validator->validated();

        try {
            $updateCommentAction->execute($comment, [
                'content' => $validated['content'],
            ]);

            $comment->load('user', 'likes');

            return back()->with([
                'success' => 'Comment updated successfully!',
                'comment' => $comment,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update comment', [
                'error' => $e->getMessage(),
                'comment_id' => $comment->id,
                'user_id' => Auth::id(),
            ]);

            return back()->withErrors(['error' => 'Failed to update comment. Please try again.']);
        }
    }

    /**
     * Remove the specified comment.
     */
    public function destroy(
        Comment $comment,
        DeleteCommentAction $deleteCommentAction
    ): RedirectResponse {
        $this->authorize('delete', $comment);

        try {
            $deleteCommentAction->execute($comment);



            return back()->with(['success' => 'Comment deleted successfully!']);
        } catch (\Exception $e) {
            Log::error('Failed to delete comment', [
                'error' => $e->getMessage(),
                'comment_id' => $comment->id,
                'user_id' => Auth::id(),
            ]);

            return back()->withErrors(['error' => 'Failed to delete comment. Please try again.']);
        }
    }
}
