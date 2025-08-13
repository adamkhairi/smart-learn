<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CategoryRequest;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use App\Actions\Category\ListCategoriesAction;
use App\Actions\Category\CreateCategoryAction;
use App\Actions\Category\UpdateCategoryAction;
use App\Actions\Category\DeleteCategoryAction;
use Illuminate\Support\Facades\Log;
use Exception;

class CategoryController extends Controller
{
    /**
     * Display a listing of categories.
     *
     * @param Request $request
     * @param ListCategoriesAction $listCategoriesAction
     * @return Response|RedirectResponse
     */
    public function index(Request $request, ListCategoriesAction $listCategoriesAction): Response|RedirectResponse
    {
        try {
            $categories = $listCategoriesAction->execute($request);

            $filters = [
                'search' => $request->get('search'),
            ];

            return Inertia::render('Admin/Categories/Index', [
                'categories' => $categories,
                'filters' => $filters,
            ]);
        } catch (Exception $e) {
            Log::error('Failed to fetch categories', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
                'filters' => $request->only(['search']),
            ]);
            
            return Redirect::back()->with('error', 'Failed to load categories. Please try again.');
        }
    }

    /**
     * Store a newly created category.
     *
     * @param CategoryRequest $request
     * @param CreateCategoryAction $createCategoryAction
     * @return RedirectResponse
     */
    public function store(CategoryRequest $request, CreateCategoryAction $createCategoryAction): RedirectResponse
    {
        try {
            $category = $createCategoryAction->execute($request);
            
            return Redirect::route('admin.categories.index')
                ->with('success', "Category '{$category->name}' created successfully.");
        } catch (Exception $e) {
            Log::error('Failed to create category', [
                'error' => $e->getMessage(),
                'data' => $request->validated(),
                'user_id' => auth()->id(),
            ]);
            
            return Redirect::back()
                ->withInput()
                ->with('error', 'Failed to create category. Please check your input and try again.');
        }
    }

    /**
     * Update the specified category.
     *
     * @param CategoryRequest $request
     * @param Category $category
     * @param UpdateCategoryAction $updateCategoryAction
     * @return RedirectResponse
     */
    public function update(CategoryRequest $request, Category $category, UpdateCategoryAction $updateCategoryAction): RedirectResponse
    {
        try {
            $updatedCategory = $updateCategoryAction->execute($request, $category);
            
            return Redirect::route('admin.categories.index')
                ->with('success', "Category '{$updatedCategory->name}' updated successfully.");
        } catch (Exception $e) {
            Log::error('Failed to update category', [
                'error' => $e->getMessage(),
                'category_id' => $category->id,
                'data' => $request->validated(),
                'user_id' => auth()->id(),
            ]);
            
            return Redirect::back()
                ->withInput()
                ->with('error', 'Failed to update category. Please check your input and try again.');
        }
    }

    /**
     * Remove the specified category.
     *
     * @param Category $category
     * @param DeleteCategoryAction $deleteCategoryAction
     * @return RedirectResponse
     */
    public function destroy(Category $category, DeleteCategoryAction $deleteCategoryAction): RedirectResponse
    {
        try {
            $categoryName = $category->name;
            $deleted = $deleteCategoryAction->execute($category);
            
            if ($deleted) {
                return Redirect::route('admin.categories.index')
                    ->with('success', "Category '{$categoryName}' deleted successfully.");
            }
            
            return Redirect::back()
                ->with('error', 'Category could not be deleted. Please try again.');
        } catch (Exception $e) {
            Log::error('Failed to delete category', [
                'error' => $e->getMessage(),
                'category_id' => $category->id,
                'category_name' => $category->name,
                'user_id' => auth()->id(),
            ]);
            
            return Redirect::back()
                ->with('error', 'Failed to delete category. It may be in use or there was a system error.');
        }
    }
}
