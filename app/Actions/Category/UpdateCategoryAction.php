<?php

declare(strict_types=1);

namespace App\Actions\Category;

use App\Models\Category;
use App\Http\Requests\Admin\CategoryRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class UpdateCategoryAction
{
    /**
     * Update an existing category.
     *
     * @param CategoryRequest $request
     * @param Category $category
     * @return Category
     * @throws Exception
     */
    public function execute(CategoryRequest $request, Category $category): Category
    {
        try {
            return DB::transaction(function () use ($request, $category) {
                $originalData = $category->toArray();
                $validatedData = $request->validated();
                
                $category->update($validatedData);
                
                Log::info('Category updated successfully', [
                    'category_id' => $category->id,
                    'original_data' => $originalData,
                    'updated_data' => $validatedData,
                    'user_id' => auth()->id(),
                ]);
                
                return $category->fresh();
            });
        } catch (Exception $e) {
            Log::error('Failed to update category', [
                'error' => $e->getMessage(),
                'category_id' => $category->id,
                'data' => $request->validated(),
                'user_id' => auth()->id(),
            ]);
            
            throw $e;
        }
    }
}
