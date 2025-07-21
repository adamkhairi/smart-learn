import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Search, Edit, Trash2, Save } from 'lucide-react';
import { useState, useEffect, FormEventHandler } from 'react';
import useDebounce from '@/hooks/use-debounce';

import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PaginatedResponse } from '@/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

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
    const breadcrumbs = [
        { title: 'Admin', href: '/admin/dashboard' },
        { title: 'Categories', href: '/admin/categories' },
    ];

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // 500ms debounce delay

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        slug: '',
    });

    useEffect(() => {
        if (debouncedSearchTerm !== filters?.search) {
            handleSearch();
        }
    }, [debouncedSearchTerm]);

    useEffect(() => {
        if (editingCategory) {
            setData({
                name: editingCategory.name,
                slug: editingCategory.slug,
            });
        } else {
            reset();
        }
    }, [editingCategory]);

    // New useEffect to generate slug from name
    useEffect(() => {
        if (data.name) {
            const generatedSlug = data.name.toLowerCase().replace(/\s+/g, '-');
            setData('slug', generatedSlug);
        } else {
            setData('slug', '');
        }
    }, [data.name]); // Depend on data.name to re-run when name changes

    const handleSearch = () => {
        router.get(
            route('admin.categories.index'),
            {
                search: searchTerm,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const openCreateDialog = () => {
        setEditingCategory(null);
        setIsFormDialogOpen(true);
        reset(); // Ensure form is reset for new entry
    };

    const openEditDialog = (category: Category) => {
        setEditingCategory(category);
        setIsFormDialogOpen(true);
        setData({
            name: category.name,
            slug: category.slug, // Use existing slug, will be regenerated if name changes
        });
    };

    const handleFormSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        if (editingCategory) {
            // Update existing category
            put(route('admin.categories.update', editingCategory.id), {
                onSuccess: () => {
                    setIsFormDialogOpen(false);
                    setEditingCategory(null);
                    reset();
                },
                onError: (err) => {
                    console.error(err);
                },
            });
        } else {
            // Create new category
            post(route('admin.categories.store'), {
                onSuccess: () => {
                    setIsFormDialogOpen(false);
                    reset();
                },
                onError: (err) => {
                    console.error(err);
                },
            });
        }
    };

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
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Category Management" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
                        <p className="text-muted-foreground">Manage all categories for courses</p>
                    </div>
                    <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Category
                    </Button>
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
                                                <Button onClick={() => openEditDialog(category)} variant="outline" size="sm" className="mr-2">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button onClick={() => handleDelete(category.id)} variant="destructive" size="sm">
                                                    <Trash2 className="h-4 w-4" />
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

                {/* Category Create/Edit Dialog */}
                <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
                            <DialogDescription>
                                {editingCategory ? 'Make changes to the category here. Click save when you\'re done.' : 'Add a new category to organize your courses.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="col-span-3"
                                    autoFocus
                                />
                                <InputError message={errors.name} className="col-span-4 col-start-2" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="slug" className="text-right">
                                    Slug
                                </Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)} // Keep onChange for internal state updates
                                    placeholder="Auto-generated if left blank"
                                    className="col-span-3"
                                    disabled // Disable the input field
                                />
                                <InputError message={errors.slug} className="col-span-4 col-start-2" />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
