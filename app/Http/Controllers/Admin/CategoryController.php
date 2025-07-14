<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Category::query();

            // Search functionality
            if ($request->filled('search')) {
                $search = $request->get('search');
                $query->where('name', 'like', "%{$search}%")
                      ->orWhere('slug', 'like', "%{$search}%");
            }

            $categories = $query->paginate(15)->withQueryString();

            $filters = [
                'search' => $request->get('search'),
            ];

            return Inertia::render('Admin/Categories/Index', [
                'categories' => $categories,
                'filters' => $filters,
            ]);
        } catch (\Exception $e) {
            // Log the error for debugging
            \Illuminate\Support\Facades\Log
::error('Error fetching categories: ' . $e->getMessage());
            return Redirect::back()->with('error', 'Failed to load categories.');
        }
    }

    public function create()
    {
        return Inertia::render('Admin/Categories/Create');
    }

    public function store(CategoryRequest $request)
    {
        try {
            Category::create($request->validated());
            return Redirect::route('admin.categories.index')->with('success', 'Category created successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log
::error('Error creating category: ' . $e->getMessage());
            return Redirect::back()->with('error', 'Failed to create category.');
        }
    }

    public function edit(Category $category)
    {
        return Inertia::render('Admin/Categories/Edit', ['category' => $category]);
    }

    public function update(CategoryRequest $request, Category $category)
    {
        try {
            $category->update($request->validated());
            return Redirect::route('admin.categories.index')->with('success', 'Category updated successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log
::error('Error updating category: ' . $e->getMessage());
            return Redirect::back()->with('error', 'Failed to update category.');
        }
    }

    public function destroy(Category $category)
    {
        try {
            $category->delete();
            return Redirect::route('admin.categories.index')->with('success', 'Category deleted successfully.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log
::error('Error deleting category: ' . $e->getMessage());
            return Redirect::back()->with('error', 'Failed to delete category.');
        }
    }
}
