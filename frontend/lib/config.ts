export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
};

// Log config on startup (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Frontend Config:', config);
}