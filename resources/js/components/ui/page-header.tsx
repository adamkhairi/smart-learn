import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { ReactNode } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    backUrl?: string;
    backLabel?: string;
    actions?: ReactNode;
    stats?: Array<{
        label: string;
        value: string | number;
        icon?: ReactNode;
    }>;
    badges?: Array<{
        label: string;
        variant?: 'default' | 'secondary' | 'outline';
    }>;
    className?: string;
}

export function PageHeader({
    title,
    description,
    backUrl,
    backLabel = 'Back',
    actions,
    stats,
    badges,
    className = '',
}: PageHeaderProps) {
    return (
        <div className={`flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${className}`}>
            <div className="min-w-0 flex-1">
                {/* Back Button */}
                {backUrl && (
                    <div className="mb-3 flex items-center gap-2 sm:mb-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={backUrl}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {backLabel}
                            </Link>
                        </Button>
                    </div>
                )}

                {/* Title and Badges */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="truncate text-2xl font-bold sm:text-3xl">{title}</h1>
                        {badges?.map((badge, index) => (
                            <Badge key={index} variant={badge.variant || 'default'}>
                                {badge.label}
                            </Badge>
                        ))}
                    </div>

                    {description && (
                        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
                            {description}
                        </p>
                    )}

                    {/* Stats */}
                    {stats && stats.length > 0 && (
                        <div className="flex items-center gap-4 text-xs text-muted-foreground sm:text-sm">
                            {stats.map((stat, index) => (
                                <span key={index} className="flex items-center gap-1">
                                    {stat.icon}
                                    {stat.label}: {stat.value}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            {actions && (
                <div className="flex flex-wrap items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}

// Common action buttons
export const commonActions = {
    create: (href: string, label = 'Create', icon = <Plus className="mr-2 h-4 w-4" />) => (
        <Button asChild>
            <Link href={href}>
                {icon}
                {label}
            </Link>
        </Button>
    ),
};
