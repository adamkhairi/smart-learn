import { useForm } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface UseFormHandlerOptions<T> {
    initialData: T;
    onSuccess?: () => void;
    onError?: (errors: Record<string, string>) => void;
    preserveState?: boolean;
    preserveScroll?: boolean;
}

export function useFormHandler<T extends Record<string, unknown>>({
    initialData,
    onSuccess,
    onError,
    preserveState = true,
    preserveScroll = true,
}: UseFormHandlerOptions<T>) {
    const [isProcessing, setIsProcessing] = useState(false);

    const form = useForm(initialData);

    const handleSubmit = useCallback(
        (url: string, method: 'post' | 'put' | 'patch' | 'delete' = 'post') => {
            setIsProcessing(true);

            const options = {
                preserveState,
                preserveScroll,
                onSuccess: () => {
                    setIsProcessing(false);
                    onSuccess?.();
                },
                onError: (errors: Record<string, string>) => {
                    setIsProcessing(false);
                    onError?.(errors);
                },
                onFinish: () => {
                    setIsProcessing(false);
                },
            };

            switch (method) {
                case 'post':
                    form.post(url, options);
                    break;
                case 'put':
                    form.put(url, options);
                    break;
                case 'patch':
                    form.patch(url, options);
                    break;
                case 'delete':
                    form.delete(url, options);
                    break;
            }
        },
        [form, preserveState, preserveScroll, onSuccess, onError]
    );

    const resetForm = useCallback(() => {
        form.reset();
        form.clearErrors();
    }, [form]);

    return {
        ...form,
        isProcessing,
        handleSubmit,
        resetForm,
    };
}
