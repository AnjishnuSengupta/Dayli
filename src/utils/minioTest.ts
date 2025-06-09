/**
 * Simple test script to verify MinIO connection and credentials
 */
import { uploadFile } from '../lib/storage-browser';

export const testMinIOConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing MinIO connection...');
    console.log('MinIO Config:', {
      endpoint: import.meta.env.VITE_MINIO_ENDPOINT,
      port: import.meta.env.VITE_MINIO_PORT,
      useSSL: import.meta.env.VITE_MINIO_USE_SSL,
      bucket: import.meta.env.VITE_MINIO_BUCKET_NAME,
      accessKey: import.meta.env.VITE_MINIO_ACCESS_KEY ? '***' : 'NOT SET'
    });

    // Create a small test file
    const testContent = 'Hello MinIO!';
    const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
    
    // Try to upload the test file
    const url = await uploadFile(testFile, 'test');
    console.log('✅ MinIO connection successful!', url);
    return true;
  } catch (error) {
    console.error('❌ MinIO connection failed:', error);
    return false;
  }
};

// Export for console testing
declare global {
  interface Window {
    testMinIO: typeof testMinIOConnection;
  }
}
window.testMinIO = testMinIOConnection;
