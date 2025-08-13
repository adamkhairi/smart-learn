<?php

declare(strict_types=1);

namespace App\Actions\Category;

use App\Models\Category;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class DeleteCategoryAction
{
    /**
     * Delete a category.
     *
     * @param Category $category
     * @return bool
     * @throws Exception
     */
    public function execute(Category $category): bool
    {
        try {
            return DB::transaction(function () use ($category) {
                $categoryData = $category->toArray();
                
                // Check if category has any associated data that should prevent deletion
                // Add any business logic checks here if needed
                
                $deleted = $category->delete();
                
                if ($deleted) {
                    Log::info('Category deleted successfully', [
                        'category_id' => $category->id,
                        'category_data' => $categoryData,
                        'user_id' => auth()->id(),
                    ]);
                }
                
                return $deleted;
            });
        } catch (Exception $e) {
            Log::error('Failed to delete category', [
                'error' => $e->getMessage(),
                'category_id' => $category->id,
                'user_id' => auth()->id(),
            ]);
            
            throw $e;
        }
    }
}
