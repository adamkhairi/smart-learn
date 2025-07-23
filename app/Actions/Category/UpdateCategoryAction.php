<?php

namespace App\Actions\Category;

use App\Models\Category;
use App\Http\Requests\Admin\CategoryRequest;

class UpdateCategoryAction
{
    public function execute(CategoryRequest $request, Category $category): bool
    {
        return $category->update($request->validated());
    }
}
