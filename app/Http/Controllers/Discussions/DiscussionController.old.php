<?php

namespace App\Http\Controllers\Discussions;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Discussion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DiscussionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Course $course): Response
    {
        $this->authorize('viewAny', [Discussion::class, $course]);

        $discussions = $course->discussions()
            ->with('user')
            ->withCount('comments')
            ->latest()
            ->paginate(10);

        return Inertia::render('Courses/Discussions/Index', [
            'discussionable' => [
                'type' => 'course',
                'id' => $course->id,
                'title' => $course->title ?? $course->name,
            ],
            'discussions' => $discussions,
        ]);
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
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Course $course)
    {
        $this->authorize('create', [Discussion::class, $course]);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $discussion = $course->discussions()->create([
            'created_by' => auth()->id(),
            'title' => $validated['title'],
            'content' => $validated['content'],
        ]);

        return redirect()->route('courses.discussions.show', ['course' => $course->id, 'discussion' => $discussion->id])
            ->with('success', 'Discussion started successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course, Discussion $discussion): Response
    {
        $this->authorize('view', $discussion);

        $discussion->load(['user', 'comments.user', 'comments.replies' => function ($query) {
            $query->with('user', 'likes')->orderBy('created_at', 'asc');
        }, 'comments.likes']);

        return Inertia::render('Courses/Discussions/Show', [
            'course' => $course,
            'discussion' => $discussion,
            'comments' => $discussion->comments->whereNull('parent_id')->values()->all(),
        ]);
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
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course, Discussion $discussion)
    {
        $this->authorize('update', $discussion);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $discussion->update($validated);

        return redirect()->route('courses.discussions.show', ['course' => $course->id, 'discussion' => $discussion->id])
            ->with('success', 'Discussion updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course, Discussion $discussion)
    {
        $this->authorize('delete', $discussion);

        $discussion->delete();

        return redirect()->route('courses.discussions.index', $course)
            ->with('success', 'Discussion deleted successfully.');
    }
}
