// Backend configuration - MongoDB Only
export const BACKEND_CONFIG = {
  // Fixed to MongoDB backend
  BACKEND: 'mongodb' as const,
  
  // Helper functions
  useMongoDB: () => true
};

// Console log for debugging
console.log('🔧 Backend Configuration: MongoDB (Fixed)');
