import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';

interface NavigationItem {
    title: string;
    href: string;
    isActive?: boolean;
    items?: NavigationItem[];
}

interface NavigationBreadcrumbProps {
    items: NavigationItem[];
    showHome?: boolean;
}

export function NavigationBreadcrumb({ items, showHome = true }: NavigationBreadcrumbProps) {
    return (
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
            {showHome && (
                <>
                    <Button variant="ghost" size="sm" asChild className="h-6 px-2">
                        <Link href="/dashboard">
                            <Home className="h-3 w-3" />
                        </Link>
                    </Button>
                    <ChevronRight className="h-3 w-3" />
                </>
            )}

            {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-1">
                    {item.items && item.items.length > 0 ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className={`h-6 px-2 ${item.isActive ? 'font-medium text-foreground' : ''}`}>
                                    {item.title}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                {item.items.map((subItem, subIndex) => (
                                    <DropdownMenuItem key={subIndex} asChild>
                                        <Link href={subItem.href}>{subItem.title}</Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <Button variant="ghost" size="sm" asChild className={`h-6 px-2 ${item.isActive ? 'font-medium text-foreground' : ''}`}>
                            <Link href={item.href}>{item.title}</Link>
                        </Button>
                    )}

                    {index < items.length - 1 && <ChevronRight className="h-3 w-3" />}
                </div>
            ))}
        </nav>
    );
}
