<?php

namespace App\Actions\Category;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class ListCategoriesAction
{
    public function execute(Request $request): LengthAwarePaginator
    {
        $query = Category::query();

        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
        }

        return $query->paginate(15)->withQueryString();
    }
}
