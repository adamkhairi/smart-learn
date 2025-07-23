<?php

namespace App\Actions\Category;

use App\Models\Category;
use App\Http\Requests\Admin\CategoryRequest;

class CreateCategoryAction
{
    public function execute(CategoryRequest $request): Category
    {
        return Category::create($request->validated());
    }
}
