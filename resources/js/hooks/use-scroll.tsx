import { useEffect, useRef, useCallback, useState } from 'react';

interface ScrollOptions {
    behavior?: ScrollBehavior;
    block?: ScrollLogicalPosition;
    inline?: ScrollLogicalPosition;
}

interface UseScrollReturn {
    scrollToTop: () => void;
    scrollToElement: (element: HTMLElement | string, options?: ScrollOptions) => void;
    scrollToSection: (sectionId: string, options?: ScrollOptions) => void;
    scrollToBottom: () => void;
    scrollContainerRef: React.RefObject<HTMLElement | null>;
    isScrolled: boolean;
    scrollPosition: number;
    scrollDirection: 'up' | 'down' | null;
}

export function useScroll(): UseScrollReturn {
    const scrollContainerRef = useRef<HTMLElement>(null);
    const lastScrollPosition = useRef(0);
    const scrollDirection = useRef<'up' | 'down' | null>(null);
    const isScrolled = useRef(false);
    const scrollPosition = useRef(0);

    // Smooth scroll to top
    const scrollToTop = useCallback(() => {
        const container = scrollContainerRef.current || window;
        container.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, []);

        // Smooth scroll to bottom
    const scrollToBottom = useCallback(() => {
        const container = scrollContainerRef.current || window;
        if (container === window) {
            container.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });
        } else {
            container.scrollTo({
                top: (container as HTMLElement).scrollHeight,
                behavior: 'smooth'
            });
        }
    }, []);

    // Scroll to specific element
    const scrollToElement = useCallback((
        element: HTMLElement | string,
        options: ScrollOptions = { behavior: 'smooth', block: 'start' }
    ) => {
        const targetElement = typeof element === 'string'
            ? document.querySelector(element) as HTMLElement
            : element;

        if (targetElement) {
            targetElement.scrollIntoView(options);
        }
    }, []);

    // Scroll to section by ID
    const scrollToSection = useCallback((
        sectionId: string,
        options: ScrollOptions = { behavior: 'smooth', block: 'start' }
    ) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView(options);
        }
    }, []);

    // Handle scroll events
    useEffect(() => {
        const handleScroll = () => {
            const container = scrollContainerRef.current || window;
            let currentScrollPosition: number;

            if (container === window) {
                currentScrollPosition = window.scrollY;
            } else {
                currentScrollPosition = (container as HTMLElement).scrollTop;
            }

            // Update scroll position
            scrollPosition.current = currentScrollPosition;

            // Determine scroll direction
            if (currentScrollPosition > lastScrollPosition.current) {
                scrollDirection.current = 'down';
            } else if (currentScrollPosition < lastScrollPosition.current) {
                scrollDirection.current = 'up';
            }

            // Check if scrolled
            isScrolled.current = currentScrollPosition > 10;

            lastScrollPosition.current = currentScrollPosition;
        };

        const container = scrollContainerRef.current || window;
        container.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            container.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return {
        scrollToTop,
        scrollToElement,
        scrollToSection,
        scrollToBottom,
        scrollContainerRef,
        isScrolled: isScrolled.current,
        scrollPosition: scrollPosition.current,
        scrollDirection: scrollDirection.current,
    };
}

// Hook for scroll restoration
export function useScrollRestoration() {
    useEffect(() => {
        // Restore scroll position on page load
        const savedPosition = sessionStorage.getItem('scrollPosition');
        if (savedPosition) {
            setTimeout(() => {
                window.scrollTo(0, parseInt(savedPosition));
            }, 100);
        }

        // Save scroll position before page unload
        const handleBeforeUnload = () => {
            sessionStorage.setItem('scrollPosition', window.scrollY.toString());
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);
}

// Hook for infinite scroll
export function useInfiniteScroll(
    callback: () => void,
    options: {
        threshold?: number;
        root?: Element | null;
        rootMargin?: string;
    } = {}
) {
    const { threshold = 0.1, root = null, rootMargin = '100px' } = options;

    const observerRef = useRef<IntersectionObserver | null>(null);
    const targetRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        callback();
                    }
                });
            },
            {
                threshold,
                root,
                rootMargin,
            }
        );

        observerRef.current = observer;

        if (targetRef.current) {
            observer.observe(targetRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [callback, threshold, root, rootMargin]);

    return targetRef;
}

// Hook for scroll-based animations
export function useScrollAnimation(
    threshold: number = 0.1,
    rootMargin: string = '0px'
) {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                threshold,
                rootMargin,
            }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [threshold, rootMargin]);

    return { elementRef, isVisible };
}

// Utility function for smooth scrolling to anchor links
export function smoothScrollToAnchor(hash: string) {
    const element = document.querySelector(hash);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
        });
    }
}

// Utility function for scroll to top with offset
export function scrollToTopWithOffset(offset: number = 0) {
    window.scrollTo({
        top: offset,
        behavior: 'smooth',
    });
}

// Utility function for scroll to element with offset
export function scrollToElementWithOffset(
    element: HTMLElement,
    offset: number = 0
) {
    const elementPosition = element.offsetTop;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
    });
}
