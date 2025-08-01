import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { NotificationsPageProps, Notification, BreadcrumbItem } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { 
    Bell, 
    Check, 
    X, 
    Trash2, 
    Filter, 
    CheckCircle, 
    AlertTriangle, 
    XCircle, 
    AlertCircle,
    ExternalLink,
    MoreVertical 
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Notifications', href: '/notifications' },
];

const NotificationsIndex: React.FC<NotificationsPageProps> = ({
    notifications,
    counts,
    typeCounts,
    filters,
}) => {
    const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
    const [showFilters, setShowFilters] = useState(false);

    // Get notification icon based on type
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'error':
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-blue-500" />;
        }
    };

    // Get notification type badge color
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'error':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        }
    };

    // Handle filter change
    const handleFilterChange = (key: string, value: string) => {
        const currentParams = new URLSearchParams(window.location.search);
        
        if (value === 'all') {
            currentParams.delete(key);
        } else {
            currentParams.set(key, value);
        }
        
        router.get('/notifications', Object.fromEntries(currentParams));
    };

    // Mark notification as read
    const markAsRead = async (notificationId: number) => {
        try {
            await fetch(`/notifications/${notificationId}/read`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            router.reload({ only: ['notifications', 'counts'] });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await fetch('/notifications/mark-all-read', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            router.reload({ only: ['notifications', 'counts'] });
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    // Delete notification
    const deleteNotification = async (notificationId: number) => {
        if (!confirm('Are you sure you want to delete this notification?')) return;
        
        try {
            await fetch(`/notifications/${notificationId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            router.reload({ only: ['notifications', 'counts'] });
        } catch (error) {
            console.error('Failed to delete notification:', error);
        }
    };

    // Delete all read notifications
    const deleteAllRead = async () => {
        if (!confirm('Are you sure you want to delete all read notifications?')) return;
        
        try {
            await fetch('/notifications/delete-all-read', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            router.reload({ only: ['notifications', 'counts'] });
        } catch (error) {
            console.error('Failed to delete read notifications:', error);
        }
    };

    // Handle notification click
    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read_at) {
            markAsRead(notification.id);
        }
        
        if (notification.action_url) {
            router.visit(notification.action_url);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Notifications" />
            
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Bell className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    Notifications
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Stay updated with your learning progress
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filters</span>
                            </button>
                            
                            {counts.unread > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                                >
                                    <Check className="w-4 h-4" />
                                    <span>Mark All Read</span>
                                </button>
                            )}
                            
                            {counts.read > 0 && (
                                <button
                                    onClick={deleteAllRead}
                                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span>Delete Read</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {counts.all}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {counts.unread}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Unread</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {counts.read}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Read</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                            {typeCounts.success + typeCounts.warning + typeCounts.error}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Important</div>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Status Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Status
                                </label>
                                <select
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="all">All Notifications</option>
                                    <option value="unread">Unread Only</option>
                                    <option value="read">Read Only</option>
                                </select>
                            </div>

                            {/* Type Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Type
                                </label>
                                <select
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="all">All Types</option>
                                    <option value="info">Info ({typeCounts.info})</option>
                                    <option value="success">Success ({typeCounts.success})</option>
                                    <option value="warning">Warning ({typeCounts.warning})</option>
                                    <option value="error">Error ({typeCounts.error})</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notifications List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    {notifications.data.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No notifications found
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {filters.status !== 'all' || filters.type !== 'all'
                                    ? 'Try adjusting your filters to see more notifications.'
                                    : 'You\'ll see notifications here when you have updates.'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.data.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                                        !notification.read_at ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className="flex-shrink-0 mt-1">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                        {notification.title}
                                                    </h3>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                                                        {notification.type}
                                                    </span>
                                                    {!notification.read_at && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    )}
                                                </div>
                                                
                                                <p className="text-gray-600 dark:text-gray-300 mb-3">
                                                    {notification.message}
                                                </p>
                                                
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                    </p>
                                                    
                                                    <div className="flex items-center space-x-2">
                                                        {notification.action_url && (
                                                            <button
                                                                onClick={() => handleNotificationClick(notification)}
                                                                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                                <span>View</span>
                                                            </button>
                                                        )}
                                                        
                                                        {!notification.read_at && (
                                                            <button
                                                                onClick={() => markAsRead(notification.id)}
                                                                className="flex items-center space-x-1 text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                                <span>Mark Read</span>
                                                            </button>
                                                        )}
                                                        
                                                        <button
                                                            onClick={() => deleteNotification(notification.id)}
                                                            className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {notifications.links && notifications.links.length > 3 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Showing {notifications.meta.from} to {notifications.meta.to} of {notifications.meta.total} notifications
                                </div>
                                <div className="flex space-x-1">
                                    {notifications.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 text-sm rounded-lg ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default NotificationsIndex;
