// Simple test to check Pusher connection
// Add this to your browser console to test

console.log('=== Pusher Connection Test ===');

// Check if Echo is available
if (window.Echo) {
    console.log('✅ Echo is available');
    
    // Check if it has a connector
    if (window.Echo.connector) {
        console.log('✅ Echo connector exists');
        
        // Check Pusher connection state
        if (window.Echo.connector.pusher) {
            const state = window.Echo.connector.pusher.connection.state;
            console.log(`📡 Pusher connection state: ${state}`);
            
            // Try to connect if not connected
            if (state === 'disconnected' || state === 'failed') {
                console.log('🔄 Attempting to reconnect...');
                window.Echo.connector.pusher.connect();
            }
        } else {
            console.log('❌ No Pusher instance found');
        }
    } else {
        console.log('❌ No Echo connector (likely using fallback mode)');
    }
} else {
    console.log('❌ Echo not available');
}

// Check environment variables
console.log('Environment variables:', {
    VITE_PUSHER_APP_KEY: import.meta?.env?.VITE_PUSHER_APP_KEY || 'Not available in this context',
    VITE_PUSHER_APP_CLUSTER: import.meta?.env?.VITE_PUSHER_APP_CLUSTER || 'Not available in this context'
});
