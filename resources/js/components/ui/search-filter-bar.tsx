import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, Filter, X } from 'lucide-react';

interface FilterOption {
    value: string;
    label: string;
}

interface SearchFilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchPlaceholder?: string;
    filters?: Array<{
        key: string;
        value: string;
        label: string;
        options: FilterOption[];
        onChange: (value: string) => void;
    }>;
    showClearButton?: boolean;
    onClear?: () => void;
    className?: string;
}

export function SearchFilterBar({
    searchQuery,
    onSearchChange,
    searchPlaceholder = 'Search...',
    filters = [],
    showClearButton = false,
    onClear,
    className = '',
}: SearchFilterBarProps) {
    const hasActiveFilters = searchQuery || filters.some(filter => filter.value !== 'all');

    return (
        <div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 ${className}`}>
            {/* Search Input */}
            <div className="relative w-full flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-9 pl-9 sm:h-10"
                />
            </div>

            {/* Filters */}
            {filters.map((filter) => (
                <DropdownMenu key={filter.key}>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="min-w-[120px] justify-start">
                            <Filter className="mr-2 h-4 w-4" />
                            <span className="capitalize">
                                {filter.value === 'all' ? filter.label : filter.value}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                        {filter.options.map((option) => (
                            <DropdownMenuItem
                                key={option.value}
                                onClick={() => filter.onChange(option.value)}
                            >
                                {option.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            ))}

            {/* Clear Button */}
            {showClearButton && hasActiveFilters && onClear && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClear}
                    className="text-muted-foreground hover:text-foreground"
                >
                    <X className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            )}
        </div>
    );
}
