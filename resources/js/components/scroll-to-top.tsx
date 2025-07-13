import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollToTopProps {
    className?: string;
    threshold?: number;
    showOnScroll?: boolean;
}

export default function ScrollToTop({
    className,
    threshold = 300,
    showOnScroll = true
}: ScrollToTopProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!showOnScroll) return;

        const toggleVisibility = () => {
            if (window.scrollY > threshold) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility, { passive: true });

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, [threshold, showOnScroll]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    if (!showOnScroll && !isVisible) {
        return null;
    }

    return (
        <Button
            onClick={scrollToTop}
            className={cn(
                'fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full p-0 shadow-lg transition-all duration-300 hover:shadow-xl',
                'bg-[#f53003] hover:bg-[#d92b02] dark:bg-[#FF4433] dark:hover:bg-[#e83b29]',
                'opacity-0 scale-90',
                isVisible && 'opacity-100 scale-100',
                className
            )}
            aria-label="Scroll to top"
        >
            <ArrowUp className="h-5 w-5" />
        </Button>
    );
}

// Enhanced scroll to top with progress indicator
export function ScrollToTopWithProgress({
    className,
    threshold = 300
}: ScrollToTopProps) {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const updateScrollProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = Math.min((scrollTop / docHeight) * 100, 100);

            setScrollProgress(progress);
            setIsVisible(scrollTop > threshold);
        };

        window.addEventListener('scroll', updateScrollProgress, { passive: true });

        return () => {
            window.removeEventListener('scroll', updateScrollProgress);
        };
    }, [threshold]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <Button
            onClick={scrollToTop}
            className={cn(
                'fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full p-0 shadow-lg transition-all duration-300 hover:shadow-xl',
                'bg-[#f53003] hover:bg-[#d92b02] dark:bg-[#FF4433] dark:hover:bg-[#e83b29]',
                'opacity-0 scale-90',
                isVisible && 'opacity-100 scale-100',
                className
            )}
            aria-label="Scroll to top"
            style={{
                background: `conic-gradient(from 0deg, #f53003 ${scrollProgress * 3.6}deg, transparent ${scrollProgress * 3.6}deg)`
            }}
        >
            <ArrowUp className="h-5 w-5" />
        </Button>
    );
}

// Floating scroll indicator
export function ScrollIndicator({ className }: { className?: string }) {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        const updateScrollProgress = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = Math.min((scrollTop / docHeight) * 100, 100);

            setScrollProgress(progress);
        };

        window.addEventListener('scroll', updateScrollProgress, { passive: true });

        return () => {
            window.removeEventListener('scroll', updateScrollProgress);
        };
    }, []);

    return (
        <div className={cn(
            'fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-800',
            className
        )}>
            <div
                className="h-full bg-[#f53003] dark:bg-[#FF4433] transition-all duration-150 ease-out"
                style={{ width: `${scrollProgress}%` }}
            />
        </div>
    );
}
