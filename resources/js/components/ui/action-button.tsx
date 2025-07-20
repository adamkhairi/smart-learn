import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MoreVertical, Edit, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import { ReactNode } from 'react';

interface ActionButtonProps {
    variant?: 'default' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg';
    loading?: boolean;
    disabled?: boolean;
    onClick?: () => void;
    children: ReactNode;
    className?: string;
}

export function ActionButton({
    variant = 'default',
    size = 'default',
    loading = false,
    disabled = false,
    onClick,
    children,
    className,
}: ActionButtonProps) {
    if (loading) {
        return (
            <LoadingButton
                variant={variant}
                size={size}
                loading={loading}
                disabled={disabled}
                onClick={onClick}
                className={className}
            >
                {children}
            </LoadingButton>
        );
    }

    return (
        <Button
            variant={variant}
            size={size}
            disabled={disabled}
            onClick={onClick}
            className={className}
        >
            {children}
        </Button>
    );
}

interface ActionMenuProps {
    items: Array<{
        label: string;
        icon?: ReactNode;
        onClick: () => void;
        variant?: 'default' | 'destructive';
    }>;
    trigger?: ReactNode;
    align?: 'start' | 'center' | 'end';
    className?: string;
}

export function ActionMenu({ items, trigger, align = 'end', className }: ActionMenuProps) {
    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        {trigger || (
                            <Button variant="ghost" size="sm" className={className}>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        )}
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>More options</p>
                </TooltipContent>
            </Tooltip>
            <DropdownMenuContent align={align} className="w-48">
                {items.map((item, index) => (
                    <DropdownMenuItem
                        key={index}
                        onClick={item.onClick}
                        className={item.variant === 'destructive' ? 'text-red-600 focus:text-red-600' : ''}
                    >
                        {item.icon}
                        {item.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Common action menu items
export const commonActions = {
    edit: (onClick: () => void) => ({
        label: 'Edit',
        icon: <Edit className="mr-2 h-4 w-4" />,
        onClick,
    }),
    duplicate: (onClick: () => void) => ({
        label: 'Duplicate',
        icon: <Copy className="mr-2 h-4 w-4" />,
        onClick,
    }),
    delete: (onClick: () => void) => ({
        label: 'Delete',
        icon: <Trash2 className="mr-2 h-4 w-4" />,
        onClick,
        variant: 'destructive' as const,
    }),
    view: (onClick: () => void) => ({
        label: 'View',
        icon: <Eye className="mr-2 h-4 w-4" />,
        onClick,
    }),
    hide: (onClick: () => void) => ({
        label: 'Hide',
        icon: <EyeOff className="mr-2 h-4 w-4" />,
        onClick,
    }),
};
