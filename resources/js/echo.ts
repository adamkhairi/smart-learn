import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: any;
    }
}

// Make Pusher available globally
window.Pusher = Pusher;

// Debug environment variables
console.log('Pusher Configuration:', {
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    host: import.meta.env.VITE_PUSHER_HOST,
    port: import.meta.env.VITE_PUSHER_PORT,
    scheme: import.meta.env.VITE_PUSHER_SCHEME,
});

// Check if Pusher credentials are available
if (!import.meta.env.VITE_PUSHER_APP_KEY) {
    console.warn('⚠️ Pusher credentials not found. Real-time notifications will not work.');
    console.log('To enable real-time notifications:');
    console.log('1. Set up a Pusher account at https://pusher.com');
    console.log('2. Add your Pusher credentials to .env file');
    console.log('3. Run: npm run build');
    
    // Create a mock Echo object to prevent errors
    window.Echo = {
        private: () => ({
            notification: () => {},
            stopListening: () => {},
        }),
        connector: null,
    };
} else {
    // Get CSRF token with better error handling
    const getCsrfToken = () => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!token) {
            console.error('❌ CSRF token not found in meta tag');
            return '';
        }
        console.log('✅ CSRF token found:', token.substring(0, 10) + '...');
        return token;
    };

    // Configure Laravel Echo with comprehensive authentication
    try {
        console.log('🔧 Initializing Laravel Echo...');
        
        window.Echo = new Echo({
            broadcaster: 'pusher',
            key: import.meta.env.VITE_PUSHER_APP_KEY,
            cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
            // Use default Pusher endpoints unless custom host is specified
            wsHost: import.meta.env.VITE_PUSHER_HOST || undefined,
            wsPort: import.meta.env.VITE_PUSHER_PORT ? parseInt(import.meta.env.VITE_PUSHER_PORT) : 80,
            wssPort: import.meta.env.VITE_PUSHER_PORT ? parseInt(import.meta.env.VITE_PUSHER_PORT) : 443,
            forceTLS: (import.meta.env.VITE_PUSHER_SCHEME ?? 'https') === 'https',
            enabledTransports: ['ws', 'wss'],
            enableLogging: true, // Enable Pusher logging for debugging
            
            // Authentication configuration
            auth: {
                headers: {
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            },
            authEndpoint: '/broadcasting/auth',
        });
        
        // Add connection event listeners for debugging
        if (window.Echo.connector && window.Echo.connector.pusher) {
            const pusher = window.Echo.connector.pusher;
            
            pusher.connection.bind('connected', () => {
                console.log('🟢 Pusher connected successfully');
            });
            
            pusher.connection.bind('disconnected', () => {
                console.log('🔴 Pusher disconnected');
            });
            
            pusher.connection.bind('error', (error: any) => {
                console.error('❌ Pusher connection error:', error);
            });
            
            pusher.connection.bind('state_change', (states: any) => {
                console.log('🔄 Pusher state change:', states.previous, '->', states.current);
            });
        }
        
        console.log('✅ Laravel Echo initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize Echo:', error);
        // Create a mock Echo object as fallback
        window.Echo = {
            private: () => ({
                notification: () => {},
                stopListening: () => {},
            }),
            connector: null,
        };
    }
}

// Add connection event listeners for debugging
if (window.Echo.connector && window.Echo.connector.pusher) {
    window.Echo.connector.pusher.connection.bind('connected', () => {
        console.log('✅ Pusher connected successfully!');
    });
    
    window.Echo.connector.pusher.connection.bind('disconnected', () => {
        console.log('❌ Pusher disconnected');
    });
    
    window.Echo.connector.pusher.connection.bind('error', (error: any) => {
        console.error('❌ Pusher connection error:', error);
    });
    
    window.Echo.connector.pusher.connection.bind('failed', () => {
        console.error('❌ Pusher connection failed');
    });
}

export default window.Echo;
