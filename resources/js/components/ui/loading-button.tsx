import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { forwardRef } from 'react';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';

interface LoadingButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
    loading?: boolean;
    loadingText?: string;
    asChild?: boolean;
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
    ({ loading = false, loadingText, children, disabled, ...props }, ref) => {
        return (
            <Button
                ref={ref}
                disabled={loading || disabled}
                {...props}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? loadingText || 'Loading...' : children}
            </Button>
        );
    }
);

LoadingButton.displayName = 'LoadingButton';
