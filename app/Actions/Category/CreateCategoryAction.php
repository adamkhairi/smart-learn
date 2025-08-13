<?php

declare(strict_types=1);

namespace App\Actions\Category;

use App\Models\Category;
use App\Http\Requests\Admin\CategoryRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;

class CreateCategoryAction
{
    /**
     * Create a new category.
     *
     * @param CategoryRequest $request
     * @return Category
     * @throws Exception
     */
    public function execute(CategoryRequest $request): Category
    {
        try {
            return DB::transaction(function () use ($request) {
                $category = Category::create($request->validated());
                
                Log::info('Category created successfully', [
                    'category_id' => $category->id,
                    'name' => $category->name,
                    'user_id' => auth()->id(),
                ]);
                
                return $category;
            });
        } catch (Exception $e) {
            Log::error('Failed to create category', [
                'error' => $e->getMessage(),
                'data' => $request->validated(),
                'user_id' => auth()->id(),
            ]);
            
            throw $e;
        }
    }
}
