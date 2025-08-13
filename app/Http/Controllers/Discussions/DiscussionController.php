<?php

declare(strict_types=1);

namespace App\Http\Controllers\Discussions;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Discussion;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use App\Actions\Discussion\ListDiscussionsAction;
use App\Actions\Discussion\CreateDiscussionAction;
use App\Actions\Discussion\ShowDiscussionAction;
use App\Actions\Discussion\UpdateDiscussionAction;
use App\Actions\Discussion\DeleteDiscussionAction;
use Exception;

class DiscussionController extends Controller
{
    /**
     * Display a listing of discussions for a course.
     *
     * @param Course $course
     * @param Request $request
     * @param ListDiscussionsAction $listDiscussionsAction
     * @return Response|RedirectResponse
     */
    public function index(Course $course, Request $request, ListDiscussionsAction $listDiscussionsAction): Response|RedirectResponse
    {
        try {
            $this->authorize('viewAny', [Discussion::class, $course]);

            $filters = $request->only(['search', 'pinned', 'locked']);
            $perPage = (int) $request->get('per_page', 10);
            
            $discussions = $listDiscussionsAction->execute($course, $filters, $perPage);

            return Inertia::render('Courses/Discussions/Index', [
                'discussionable' => [
                    'type' => 'course',
                    'id' => $course->id,
                    'title' => $course->title ?? $course->name,
                ],
                'discussions' => $discussions,
                'filters' => $filters,
            ]);
        } catch (Exception $e) {
            Log::error('Failed to list discussions', [
                'error' => $e->getMessage(),
                'course_id' => $course->id,
                'user_id' => auth()->id(),
                'filters' => $request->only(['search', 'pinned', 'locked']),
            ]);
            
            return redirect()->back()
                ->with('error', 'Failed to load discussions. Please try again.');
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Course $course): Response
    {
        $this->authorize('create', [Discussion::class, $course]);

        return Inertia::render('Courses/Discussions/Create', [
            'course' => $course,
        ]);
    }

    /**
     * Store a newly created discussion.
     *
     * @param Request $request
     * @param Course $course
     * @param CreateDiscussionAction $createDiscussionAction
     * @return RedirectResponse
     */
    public function store(Request $request, Course $course, CreateDiscussionAction $createDiscussionAction): RedirectResponse
    {
        try {
            $this->authorize('create', [Discussion::class, $course]);

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'is_pinned' => 'sometimes|boolean',
                'is_locked' => 'sometimes|boolean',
            ]);

            $discussion = $createDiscussionAction->execute($course, $validated, auth()->user());

            return redirect()->route('courses.discussions.show', [
                'course' => $course->id, 
                'discussion' => $discussion->id
            ])->with('success', "Discussion '{$discussion->title}' started successfully.");
        } catch (Exception $e) {
            Log::error('Failed to create discussion', [
                'error' => $e->getMessage(),
                'course_id' => $course->id,
                'data' => $request->only(['title', 'content', 'is_pinned', 'is_locked']),
                'user_id' => auth()->id(),
            ]);
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to create discussion. Please check your input and try again.');
        }
    }

    /**
     * Display the specified discussion.
     *
     * @param Course $course
     * @param Discussion $discussion
     * @param ShowDiscussionAction $showDiscussionAction
     * @return Response|RedirectResponse
     */
    public function show(Course $course, Discussion $discussion, ShowDiscussionAction $showDiscussionAction): Response|RedirectResponse
    {
        try {
            $this->authorize('view', $discussion);

            $discussion = $showDiscussionAction->execute($discussion, true);

            return Inertia::render('Courses/Discussions/Show', [
                'course' => $course,
                'discussion' => $discussion,
                'comments' => $discussion->comments->whereNull('parent_id')->values()->all(),
            ]);
        } catch (Exception $e) {
            Log::error('Failed to show discussion', [
                'error' => $e->getMessage(),
                'course_id' => $course->id,
                'discussion_id' => $discussion->id,
                'user_id' => auth()->id(),
            ]);
            
            return redirect()->route('courses.discussions.index', $course)
                ->with('error', 'Failed to load discussion. Please try again.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Course $course, Discussion $discussion): Response
    {
        $this->authorize('update', $discussion);

        return Inertia::render('Courses/Discussions/Edit', [
            'course' => $course,
            'discussion' => $discussion,
        ]);
    }

    /**
     * Update the specified discussion.
     *
     * @param Request $request
     * @param Course $course
     * @param Discussion $discussion
     * @param UpdateDiscussionAction $updateDiscussionAction
     * @return RedirectResponse
     */
    public function update(Request $request, Course $course, Discussion $discussion, UpdateDiscussionAction $updateDiscussionAction): RedirectResponse
    {
        try {
            $this->authorize('update', $discussion);

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'content' => 'required|string',
                'is_pinned' => 'sometimes|boolean',
                'is_locked' => 'sometimes|boolean',
            ]);

            $updatedDiscussion = $updateDiscussionAction->execute($discussion, $validated);

            return redirect()->route('courses.discussions.show', [
                'course' => $course->id, 
                'discussion' => $discussion->id
            ])->with('success', "Discussion '{$updatedDiscussion->title}' updated successfully.");
        } catch (Exception $e) {
            Log::error('Failed to update discussion', [
                'error' => $e->getMessage(),
                'course_id' => $course->id,
                'discussion_id' => $discussion->id,
                'data' => $request->only(['title', 'content', 'is_pinned', 'is_locked']),
                'user_id' => auth()->id(),
            ]);
            
            return redirect()->back()
                ->withInput()
                ->with('error', 'Failed to update discussion. Please check your input and try again.');
        }
    }

    /**
     * Remove the specified discussion.
     *
     * @param Course $course
     * @param Discussion $discussion
     * @param DeleteDiscussionAction $deleteDiscussionAction
     * @return RedirectResponse
     */
    public function destroy(Course $course, Discussion $discussion, DeleteDiscussionAction $deleteDiscussionAction): RedirectResponse
    {
        try {
            $this->authorize('delete', $discussion);

            $discussionTitle = $discussion->title;
            $deleted = $deleteDiscussionAction->execute($discussion);

            if ($deleted) {
                return redirect()->route('courses.discussions.index', $course)
                    ->with('success', "Discussion '{$discussionTitle}' deleted successfully.");
            }
            
            return redirect()->back()
                ->with('error', 'Discussion could not be deleted. Please try again.');
        } catch (Exception $e) {
            Log::error('Failed to delete discussion', [
                'error' => $e->getMessage(),
                'course_id' => $course->id,
                'discussion_id' => $discussion->id,
                'discussion_title' => $discussion->title ?? 'Unknown',
                'user_id' => auth()->id(),
            ]);
            
            return redirect()->back()
                ->with('error', 'Failed to delete discussion. It may have comments or there was a system error.');
        }
    }
}
