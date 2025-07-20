import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { ArrowRight, Sparkles, Clock, Calendar } from 'lucide-react';
import { User } from '@/types';

interface QuickAction {
    label: string;
    href: string;
    variant?: 'default' | 'outline' | 'secondary';
    icon?: React.ReactNode;
}

interface QuickStat {
    label: string;
    value: string | number;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

interface WelcomeProps {
    user: User;
    subtitle?: string;
    customMessage?: string;
    showTimeGreeting?: boolean;
    quickActions?: QuickAction[];
    quickStats?: QuickStat[];
    className?: string;
    variant?: 'card' | 'banner';
}

export default function Welcome({
    user,
    subtitle,
    customMessage,
    showTimeGreeting = true,
    quickActions = [],
    quickStats = [],
    className = "",
    variant = 'card'
}: WelcomeProps) {
    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const getStatColor = (color?: string) => {
        switch (color) {
            case 'blue':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'green':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'yellow':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'red':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'purple':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };

    const welcomeMessage = customMessage || (
        showTimeGreeting
            ? `${getTimeGreeting()}, ${user.name}!`
            : `Welcome, ${user.name}!`
    );

    const defaultSubtitle = subtitle || "Here's an overview of your learning progress and activities.";

    if (variant === 'banner') {
        return (
            <div className={`relative overflow-hidden rounded-xl bg-gradient-to-r from-[#f53003] to-[#FF9C33] p-6 text-white ${className}`}>
                {/* Background decoration */}
                <div className="absolute inset-0 bg-[url('/img/noise.svg')] opacity-10"></div>
                <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10"></div>
                <div className="absolute -bottom-2 -left-2 h-16 w-16 rounded-full bg-white/5"></div>

                <div className="relative z-10">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-5 w-5" />
                                <h1 className="text-2xl font-bold">{welcomeMessage}</h1>
                            </div>
                            <p className="text-white/90 mb-4 max-w-2xl">{defaultSubtitle}</p>

                            {/* Quick Stats */}
                            {quickStats.length > 0 && (
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {quickStats.map((stat, index) => (
                                        <div key={index} className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                                            <div className="text-lg font-bold">{stat.value}</div>
                                            <div className="text-sm text-white/80">{stat.label}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Quick Actions */}
                            {quickActions.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {quickActions.map((action, index) => (
                                        <Link key={index} href={action.href}>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
                                            >
                                                {action.icon && <span className="mr-2">{action.icon}</span>}
                                                {action.label}
                                                <ArrowRight className="ml-2 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Time indicator */}
                        {showTimeGreeting && (
                            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">
                                    {new Date().toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Sparkles className="h-6 w-6 text-[#f53003] dark:text-[#FF4433]" />
                            {welcomeMessage}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">{defaultSubtitle}</p>
                    </div>

                    {/* Time indicator */}
                    {showTimeGreeting && (
                        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>
                    )}
                </div>
            </CardHeader>

            {(quickStats.length > 0 || quickActions.length > 0) && (
                <CardContent className="pt-0">
                    {/* Quick Stats */}
                    {quickStats.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {quickStats.map((stat, index) => (
                                <Badge
                                    key={index}
                                    variant="secondary"
                                    className={getStatColor(stat.color)}
                                >
                                    <span className="font-medium">{stat.value}</span>
                                    <span className="ml-1 text-xs opacity-80">{stat.label}</span>
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Quick Actions */}
                    {quickActions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {quickActions.map((action, index) => (
                                <Link key={index} href={action.href}>
                                    <Button
                                        variant={action.variant || 'outline'}
                                        size="sm"
                                        className="gap-2"
                                    >
                                        {action.icon}
                                        {action.label}
                                        <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

// Export types for external use
export type { WelcomeProps, QuickAction, QuickStat };
