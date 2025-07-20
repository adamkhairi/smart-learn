import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCard {
    title: string;
    value: string | number;
    description?: string;
    icon?: LucideIcon;
    iconColor?: string;
    trend?: {
        value: number;
        label: string;
        isPositive?: boolean;
    };
    format?: 'number' | 'percentage' | 'currency';
    href?: string;
}

interface DashboardStatsProps {
    stats: StatCard[];
    title?: string;
    description?: string;
    columns?: 2 | 3 | 4;
    className?: string;
}

export default function DashboardStats({
    stats,
    title,
    description,
    columns = 4,
    className = ""
}: DashboardStatsProps) {
    const formatValue = (value: string | number, format?: string) => {
        if (typeof value === 'string') return value;

        switch (format) {
            case 'percentage':
                return `${value}%`;
            case 'currency':
                return `$${value.toLocaleString()}`;
            case 'number':
            default:
                return value.toLocaleString();
        }
    };

    const getGridCols = () => {
        switch (columns) {
            case 2: return 'md:grid-cols-2';
            case 3: return 'md:grid-cols-2 lg:grid-cols-3';
            case 4: return 'md:grid-cols-2 lg:grid-cols-4';
            default: return 'md:grid-cols-2 lg:grid-cols-4';
        }
    };

    const renderTrend = (trend: StatCard['trend']) => {
        if (!trend) return null;

        const trendColor = trend.isPositive !== false ? 'text-green-600' : 'text-red-600';
        const trendSymbol = trend.isPositive !== false ? '+' : '';

        return (
            <span className={`text-xs ${trendColor} font-medium`}>
                {trendSymbol}{trend.value}% {trend.label}
            </span>
        );
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header */}
            {(title || description) && (
                <div>
                    {title && (
                        <h2 className="text-2xl font-bold tracking-tight mb-2">{title}</h2>
                    )}
                    {description && (
                        <p className="text-muted-foreground">{description}</p>
                    )}
                </div>
            )}

            {/* Stats Grid */}
            <div className={`grid gap-4 ${getGridCols()}`}>
                {stats.map((stat, index) => {
                    const CardWrapper = stat.href ? 'a' : 'div';
                    const cardProps = stat.href ? { href: stat.href } : {};

                    return (
                        <CardWrapper key={index} {...cardProps} className={stat.href ? 'no-underline' : ''}>
                            <Card className={`transition-all duration-200 ${
                                stat.href
                                    ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer'
                                    : 'hover:shadow-md'
                            }`}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium line-clamp-2">
                                        {stat.title}
                                    </CardTitle>
                                    {stat.icon && (
                                        <div className={`shrink-0 ${stat.iconColor || 'text-muted-foreground'}`}>
                                            <stat.icon className="h-4 w-4" />
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold mb-1">
                                        {formatValue(stat.value, stat.format)}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        {stat.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
                                                {stat.description}
                                            </p>
                                        )}
                                        {stat.trend && (
                                            <div className="ml-2 shrink-0">
                                                {renderTrend(stat.trend)}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </CardWrapper>
                    );
                })}
            </div>
        </div>
    );
}

// Export the interface for external use
export type { StatCard, DashboardStatsProps };
