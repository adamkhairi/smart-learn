import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import useDebounce from '@/hooks/use-debounce';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PaginatedResponse } from '@/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Props {
    categories: PaginatedResponse<Category>;
    filters: {
        search?: string;
    };
}

export default function Index({ categories, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce delay

    useEffect(() => {
        if (debouncedSearchTerm !== filters?.search) {
            handleSearch();
        }
    }, [debouncedSearchTerm]);

    const handleSearch = () => {
        router.get(
            route('admin.categories.index'),
            {
                search: searchTerm,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const handleDelete = (id: number) => {
        setSelectedCategoryId(id);
        setIsConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (selectedCategoryId) {
            router.delete(route('admin.categories.destroy', selectedCategoryId), {
                onSuccess: () => {
                    setIsConfirmOpen(false);
                    setSelectedCategoryId(null);
                },
                onError: () => {
                    setIsConfirmOpen(false);
                    setSelectedCategoryId(null);
                },
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Category Management" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
                        <p className="text-muted-foreground">Manage all categories for courses</p>
                    </div>
                    <Link href={route('admin.categories.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Category
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Button onClick={handleSearch} size="sm">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Category List */}
                <Card>
                    <CardContent className="p-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.data.length > 0 ? (
                                    categories.data.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell>{category.slug}</TableCell>
                                            <TableCell className="text-right">
                                                <Link href={route('admin.categories.edit', category.id)} className="mr-2">
                                                    <Button variant="outline" size="sm">
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button onClick={() => handleDelete(category.id)} variant="destructive" size="sm">
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No categories found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <ConfirmDialog
                    open={isConfirmOpen}
                    onOpenChange={setIsConfirmOpen}
                    onConfirm={confirmDelete}
                    title="Delete Category"
                    description="Are you sure you want to delete this category? This action cannot be undone."
                />
            </div>
        </AppLayout>
    );
}
