import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void;
    loading?: boolean;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    onConfirm,
    loading = false,
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {variant === 'destructive' && (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                        )}
                        {title}
                    </DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Hook for easy usage
export function useConfirmDialog() {
    const [dialogState, setDialogState] = useState<{
        open: boolean;
        title: string;
        description: string;
        onConfirm: () => void;
        variant?: 'default' | 'destructive';
        confirmText?: string;
        loading?: boolean;
    }>({
        open: false,
        title: '',
        description: '',
        onConfirm: () => {},
    });

    const confirm = (options: Omit<typeof dialogState, 'open'>) => {
        setDialogState({ ...options, open: true });
    };

    const closeDialog = () => {
        setDialogState(prev => ({ ...prev, open: false }));
    };

    const confirmDialog = (
        <ConfirmDialog
            open={dialogState.open}
            onOpenChange={closeDialog}
            title={dialogState.title}
            description={dialogState.description}
            onConfirm={() => {
                dialogState.onConfirm();
                closeDialog();
            }}
            variant={dialogState.variant}
            confirmText={dialogState.confirmText}
            loading={dialogState.loading}
        />
    );

    return { confirm, confirmDialog, closeDialog };
}
