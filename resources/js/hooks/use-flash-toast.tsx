import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { useToast } from './use-toast';
import { router } from '@inertiajs/react';

interface FlashMessages {
    success?: string;
    error?: string;
    warning?: string;
    info?: string;
}

interface PageProps {
    flash?: FlashMessages;
    errors?: Record<string, string>;
    [key: string]: unknown;
}

export const useFlashToast = () => {
    const { flash, errors } = usePage<PageProps>().props;
    const { success, error, warning, info } = useToast();
    const hasProcessedFlash = useRef(false);
    const hasProcessedErrors = useRef(false);

    useEffect(() => {
        // Only process flash messages once per page load
        if (hasProcessedFlash.current) {
            return;
        }

        // Handle flash messages
        if (flash?.success) {
            success(flash.success);
        }

        if (flash?.error) {
            error(flash.error);
        }

        if (flash?.warning) {
            warning(flash.warning);
        }

        if (flash?.info) {
            info(flash.info);
        }

        // Mark as processed to prevent re-processing
        hasProcessedFlash.current = true;
    }, [flash, success, error, warning, info]);

    useEffect(() => {
        // Only process errors once per page load
        if (hasProcessedErrors.current) {
            return;
        }

        // Handle all validation errors from Inertia's props.errors
        if (errors && Object.keys(errors).length > 0) {
            // Check if there's a general 'error' flash message, otherwise iterate all errors
            if (flash?.error) {
                error(flash.error);
            } else {
                Object.values(errors).forEach((errorMessage) => {
                    if (typeof errorMessage === 'string') {
                        error(errorMessage);
                    }
                });
            }
        }

        // Mark as processed to prevent re-processing
        hasProcessedErrors.current = true;
    }, [errors, flash?.error, error]);

    // Reset the flags when a new Inertia visit finishes (new navigation)
    useEffect(() => {
        const resetFlags = () => {
            hasProcessedFlash.current = false;
            hasProcessedErrors.current = false;
        };

        const unsubscribe = router.on('finish', resetFlags);

        return () => {
            unsubscribe();
        };
    }, []);
};
