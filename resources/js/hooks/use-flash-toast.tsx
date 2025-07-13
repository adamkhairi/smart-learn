import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { useToast } from './use-toast';

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
    const hasProcessedErrors = useRef(false);

    useEffect(() => {
        // Only process errors on initial page load, not on every render
        if (hasProcessedErrors.current) {
            return;
        }

        // Debug: Log flash messages
        if (flash) {
            console.log('Flash messages:', flash);
        }

        if (errors && Object.keys(errors).length > 0) {
            console.log('Page errors:', errors);
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

        // Mark as processed to prevent re-processing on subsequent renders
        hasProcessedErrors.current = true;
    }, [flash, errors, success, error, warning, info]);

    // Reset the flag when the page changes (new navigation)
    useEffect(() => {
        hasProcessedErrors.current = false;
    }, []);
};
