import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Info, Zap, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function TestNotifications() {
    const [loading, setLoading] = useState<string | null>(null);

    const sendTestNotification = async (type: 'info' | 'success' | 'warning' | 'error', broadcast: boolean = false) => {
        const key = `${type}-${broadcast}`;
        setLoading(key);

        try {
            const response = await fetch('/test/notifications/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    type,
                    broadcast,
                }),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Test notification sent!', {
                    description: `${type} notification ${broadcast ? 'with real-time broadcasting' : 'database-only'} sent successfully.`
                });
            } else {
                toast.error('Failed to send notification', {
                    description: data.message
                });
            }
        } catch (error) {
            toast.error('Error sending notification', {
                description: error instanceof Error ? error.message : 'Unknown error'
            });
        } finally {
            setLoading(null);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const notificationTypes = [
        { type: 'info' as const, label: 'Info', color: 'bg-blue-100 text-blue-800' },
        { type: 'success' as const, label: 'Success', color: 'bg-green-100 text-green-800' },
        { type: 'warning' as const, label: 'Warning', color: 'bg-yellow-100 text-yellow-800' },
        { type: 'error' as const, label: 'Error', color: 'bg-red-100 text-red-800' },
    ];

    return (
        <>
            <Head title="Test Notifications" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold mb-2">Test Notification System</h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Test both database-only and real-time broadcast notifications. 
                                    Make sure you have the notification bell visible in the header to see real-time updates.
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Database-only notifications */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Database className="h-5 w-5" />
                                            Database-Only Notifications
                                        </CardTitle>
                                        <CardDescription>
                                            These notifications are stored in the database but won't trigger real-time updates.
                                            You'll need to refresh the notification bell to see them.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-3">
                                            {notificationTypes.map(({ type, label, color }) => (
                                                <Button
                                                    key={`db-${type}`}
                                                    onClick={() => sendTestNotification(type, false)}
                                                    disabled={loading === `${type}-false`}
                                                    variant="outline"
                                                    className="justify-start"
                                                >
                                                    {getIcon(type)}
                                                    <span className="ml-2">Send {label}</span>
                                                    <Badge className={`ml-auto ${color}`}>
                                                        {label}
                                                    </Badge>
                                                </Button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Real-time broadcast notifications */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Zap className="h-5 w-5 text-yellow-500" />
                                            Real-Time Broadcast Notifications
                                        </CardTitle>
                                        <CardDescription>
                                            These notifications use Pusher broadcasting for real-time delivery.
                                            You should see a toast notification appear immediately and the bell update.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid gap-3">
                                            {notificationTypes.map(({ type, label, color }) => (
                                                <Button
                                                    key={`broadcast-${type}`}
                                                    onClick={() => sendTestNotification(type, true)}
                                                    disabled={loading === `${type}-true`}
                                                    variant="outline"
                                                    className="justify-start"
                                                >
                                                    {getIcon(type)}
                                                    <span className="ml-2">Broadcast {label}</span>
                                                    <Badge className={`ml-auto ${color}`}>
                                                        <Zap className="h-3 w-3 mr-1" />
                                                        {label}
                                                    </Badge>
                                                </Button>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Testing Instructions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="font-semibold mb-2">1. Database-Only Test:</h4>
                                            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 dark:text-gray-400">
                                                <li>Click any "Send" button in the left column</li>
                                                <li>Check the notification bell - it should NOT update automatically</li>
                                                <li>Refresh the page or click the bell to fetch new notifications</li>
                                                <li>You should see the new notification appear</li>
                                            </ul>
                                        </div>
                                        
                                        <div>
                                            <h4 className="font-semibold mb-2">2. Real-Time Broadcast Test:</h4>
                                            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 dark:text-gray-400">
                                                <li>Click any "Broadcast" button in the right column</li>
                                                <li>You should immediately see a toast notification appear</li>
                                                <li>The notification bell count should update automatically</li>
                                                <li>Click the bell to see the new notification in the dropdown</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold mb-2">3. What to Check:</h4>
                                            <ul className="list-disc list-inside text-sm space-y-1 text-gray-600 dark:text-gray-400">
                                                <li>Toast notifications appear for broadcast messages</li>
                                                <li>Notification bell badge updates with unread count</li>
                                                <li>Clicking notifications marks them as read</li>
                                                <li>Different notification types show correct icons and colors</li>
                                                <li>Console logs show Pusher connection status</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
