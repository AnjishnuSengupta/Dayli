/**
 * MinIO bucket setup utility
 * This file helps create and configure the bucket for the application
 */

// Import MinIO types for proper typing
type MinioClient = import('minio').Client;

let minioClient: MinioClient | null = null;

// Dynamically import MinIO only in development
const getMinioClient = async () => {
  if (minioClient) return minioClient;
  
  try {
    const Minio = await import('minio');
    minioClient = new Minio.Client({
      endPoint: import.meta.env.VITE_MINIO_ENDPOINT || 'play.min.io',
      port: parseInt(import.meta.env.VITE_MINIO_PORT || '9000'),
      useSSL: import.meta.env.VITE_MINIO_USE_SSL === 'true',
      accessKey: import.meta.env.VITE_MINIO_ACCESS_KEY || '',
      secretKey: import.meta.env.VITE_MINIO_SECRET_KEY || '',
    });
    return minioClient;
  } catch (error) {
    console.warn('MinIO client not available in production mode');
    return null;
  }
};

const BUCKET_NAME = import.meta.env.VITE_MINIO_BUCKET_NAME || 'dayli-uploads';

export const setupBucket = async () => {
  try {
    console.log('Checking MinIO connection...');
    console.log('Config:', {
      endpoint: import.meta.env.VITE_MINIO_ENDPOINT,
      port: import.meta.env.VITE_MINIO_PORT,
      useSSL: import.meta.env.VITE_MINIO_USE_SSL,
      bucket: BUCKET_NAME
    });

    const client = await getMinioClient();
    if (!client) {
      console.log('MinIO not available, skipping bucket setup');
      return;
    }

    // Check if bucket exists
    const exists = await client.bucketExists(BUCKET_NAME);
    console.log(`Bucket '${BUCKET_NAME}' exists:`, exists);
    
    if (!exists) {
      console.log('Creating bucket...');
      await client.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log('✅ Bucket created successfully');
      
      // Set public read policy
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };
      
      await client.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
      console.log('✅ Bucket policy set to public read');
    }
    
    return true;
  } catch (error) {
    console.error('❌ MinIO setup failed:', error);
    return false;
  }
};

// Test upload using MinIO client
export const testUpload = async (file: File): Promise<string | null> => {
  try {
    const client = await getMinioClient();
    if (!client) {
      console.log('MinIO not available for test upload');
      return null;
    }

    const fileName = `test/${Date.now()}_${file.name}`;
    const buffer = await file.arrayBuffer();
    
    await client.putObject(
      BUCKET_NAME,
      fileName,
      Buffer.from(buffer),
      file.size,
      { 'Content-Type': file.type }
    );
    
    // Generate a presigned URL for access
    const url = await client.presignedGetObject(BUCKET_NAME, fileName, 7 * 24 * 60 * 60);
    console.log('✅ Test upload successful:', url);
    return url;
  } catch (error) {
    console.error('❌ Test upload failed:', error);
    return null;
  }
};

// Make functions available globally for testing
declare global {
  interface Window {
    setupMinIOBucket: () => Promise<boolean>;
    testMinIOUpload: (file: File) => Promise<string | null>;
  }
}

window.setupMinIOBucket = setupBucket;
window.testMinIOUpload = testUpload;
