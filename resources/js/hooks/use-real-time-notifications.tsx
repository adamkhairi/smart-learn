import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';

interface NotificationData {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    data?: any;
    action_url?: string;
    read?: boolean;
    created_at: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    // Add other user properties as needed
}

interface PageProps {
    auth: {
        user: User;
    };
    [key: string]: any;
}

export function useRealTimeNotifications() {
    const { props } = usePage<PageProps>();
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!props.auth?.user || !window.Echo) {
            return;
        }

        const userId = props.auth.user.id;
        const channelName = `user.${userId}`;
        console.log('🎯 Setting up real-time notifications for user:', userId);
        console.log('📡 Listening on channel:', channelName);
        
        // Leave any existing channel first to prevent duplicates
        try {
            window.Echo.leaveChannel(`private-${channelName}`);
        } catch (e) {
            // Ignore if channel doesn't exist
        }
        
        const channel = window.Echo.private(channelName);
        console.log('✅ Private channel created:', channel);

        // Add test event listener for debugging broadcast functionality
        channel.listen('.test.event', (data: any) => {
            console.log('🧪 TEST EVENT RECEIVED:', data);
            toast.success('Test Broadcast Working!', { description: data.message });
        });

        // Add global event listener to debug what events are actually being received
        if (channel.pusher) {
            channel.pusher.bind_global((eventName: string, data: any) => {
                console.log('🌐 Global event received:', eventName, data);
                if (eventName.includes('notification') || eventName.includes('test')) {
                    console.log('🎯 IMPORTANT EVENT DETECTED:', eventName, data);
                }
            });
        }

        // Listen for Laravel notification events (Laravel broadcasts notifications differently)
        channel.notification((notification: any) => {
            console.log('📨 Laravel notification received:', notification);
            
            // Handle Laravel notification format
            const notificationData = {
                id: notification.id || Date.now().toString(),
                title: notification.title || 'Notification',
                message: notification.message || '',
                type: notification.type || 'info',
                action_url: notification.action_url || null,
                data: notification.data || null,
                created_at: notification.created_at || new Date().toISOString(),
                read_at: null
            };
            
            // Show toast notification
            switch (notificationData.type) {
                case 'success':
                    toast.success(notificationData.title, { description: notificationData.message });
                    break;
                case 'error':
                    toast.error(notificationData.title, { description: notificationData.message });
                    break;
                case 'warning':
                    toast.warning(notificationData.title, { description: notificationData.message });
                    break;
                default:
                    toast.info(notificationData.title, { description: notificationData.message });
                    break;
            }
            
            // Trigger custom event for NotificationBell component
            window.dispatchEvent(new CustomEvent('newNotification', {
                detail: notificationData
            }));
        });
        
        // Also listen for custom broadcast events (backup method)
        channel.listen('.notification.created', (notification: NotificationData) => {
            console.log('📨 Custom notification received:', notification);
            
            // Convert to proper notification format for compatibility
            const formattedNotification: NotificationData = {
                id: notification.id || Date.now().toString(),
                title: notification.title || 'Notification',
                message: notification.message || '',
                type: notification.type || 'info',
                action_url: notification.action_url || undefined,
                data: notification.data || {},
                created_at: notification.created_at || new Date().toISOString(),
            };
            
            // Add to notifications list
            setNotifications(prev => [formattedNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show toast notification immediately
            const title = notification.title || 'Notification';
            const message = notification.message || '';
            
            switch (notification.type) {
                case 'success':
                    toast.success(title, { description: message });
                    break;
                case 'error':
                    toast.error(title, { description: message });
                    break;
                case 'warning':
                    toast.warning(title, { description: message });
                    break;
                default:
                    toast.info(title, { description: message });
                    break;
            }
            
            // Trigger a custom event to update NotificationBell component
            window.dispatchEvent(new CustomEvent('newNotification', {
                detail: formattedNotification
            }));
        });

        // Cleanup on unmount
        return () => {
            console.log('🧹 Cleaning up real-time notifications channel');
            try {
                channel.stopListening('.notification.created');
                window.Echo.leaveChannel(`private-${channelName}`);
            } catch (e) {
                console.warn('Error cleaning up channel:', e);
            }
        };
    }, [props.auth?.user]);

    const markAsRead = (notificationId: string) => {
        setNotifications(prev => 
            prev.map(notification => 
                notification.id === notificationId 
                    ? { ...notification, read: true }
                    : notification
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => 
            prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    return {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
    };
}

function showToastNotification(
    type: string, 
    title: string, 
    message: string, 
    toastMethods: { success: Function; error: Function; warning: Function; info: Function }
) {
    switch (type) {
        case 'success':
            toastMethods.success(title, message);
            break;
        case 'error':
            toastMethods.error(title, message);
            break;
        case 'warning':
            toastMethods.warning(title, message);
            break;
        case 'info':
        default:
            toastMethods.info(title, message);
            break;
    }
}
