import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, Clock, AlertCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { Notification } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface NotificationBellProps {
    className?: string;
}

interface NotificationResponse {
    notifications: Notification[];
    unread_count: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch recent notifications
    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await fetch('/notifications/recent');
            const data: NotificationResponse = await response.json();
            setNotifications(data.notifications);
            setUnreadCount(data.unread_count);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
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
            
            // Update local state
            setNotifications(prev => 
                prev.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, read_at: new Date().toISOString() }
                        : notification
                )
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
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
            
            // Update local state
            setNotifications(prev => 
                prev.map(notification => ({ ...notification, read_at: new Date().toISOString() }))
            );
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
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
        
        setIsOpen(false);
    };

    // Get notification icon based on type
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'error':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-blue-500" />;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    // Fetch notifications when component mounts or dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    // Fetch notifications on mount
    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 rounded-full"
                aria-label="Notifications"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <Bell className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-12' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <div className={`absolute right-0 mt-2 w-80 origin-top-right transition-all duration-200 ease-out z-50 ${
                isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
            }`}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Notifications
                        </h3>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                </div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                    No notifications yet
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    You're all caught up!
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`group cursor-pointer transition-all duration-200 ${
                                            !notification.read_at 
                                                ? 'bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20' 
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                        }`}
                                    >
                                        <div className="p-4 transition-transform duration-200 group-hover:translate-x-1">
                                            <div className="flex items-start space-x-3">
                                                <div className={`flex-shrink-0 mt-0.5 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                                    notification.type === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
                                                    notification.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                                                    notification.type === 'error' ? 'bg-red-100 dark:bg-red-900/20' :
                                                    'bg-blue-100 dark:bg-blue-900/20'
                                                }`}>
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between">
                                                        <p className={`text-sm font-medium ${
                                                            !notification.read_at 
                                                                ? 'text-gray-900 dark:text-white' 
                                                                : 'text-gray-700 dark:text-gray-300'
                                                        }`}>
                                                            {notification.title}
                                                        </p>
                                                        {!notification.read_at && (
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2 mt-2 animate-pulse"></div>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center">
                                                        <Clock className="w-3 h-3 mr-1" />
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                        {notifications.length > 0 ? (
                            <Link
                                href="/notifications"
                                className="block text-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors py-2 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50"
                                onClick={() => setIsOpen(false)}
                            >
                                View all notifications
                            </Link>
                        ) : (
                            <button
                                onClick={fetchNotifications}
                                className="w-full text-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors py-2 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50"
                            >
                                Refresh
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationBell;
