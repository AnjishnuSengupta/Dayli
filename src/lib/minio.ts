interface MinioClient {
  bucketExists: (bucket: string) => Promise<boolean>;
  makeBucket: (bucket: string, region: string) => Promise<void>;
  setBucketPolicy: (bucket: string, policy: string) => Promise<void>;
  putObject: (bucket: string, name: string, buffer: Buffer, size: number, metadata?: object) => Promise<unknown>;
  presignedGetObject: (bucket: string, name: string, expiry: number) => Promise<string>;
  removeObject: (bucket: string, name: string) => Promise<void>;
}

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

const BUCKET = import.meta.env.VITE_MINIO_BUCKET_NAME || 'dayli-data';

// Initialize the bucket if it doesn't exist
export const initializeBucket = async () => {
  try {
    const client = await getMinioClient();
    if (!client) {
      console.log('MinIO not available, skipping bucket initialization');
      return;
    }

    const exists = await client.bucketExists(BUCKET);
    if (!exists) {
      await client.makeBucket(BUCKET, 'us-east-1');
      console.log(`Bucket '${BUCKET}' created successfully`);
      
      // Set bucket policy to allow public read access for images
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET}/*`],
          },
        ],
      };
      
      await client.setBucketPolicy(BUCKET, JSON.stringify(policy));
    }
  } catch (error) {
    console.error('Error initializing MinIO bucket:', error);
  }
};

// Upload a file to MinIO with optional path prefix
export const uploadFile = async (file: File, pathPrefix: string = 'memories'): Promise<string> => {
  const client = await getMinioClient();
  if (!client) {
    throw new Error('MinIO not available in production mode');
  }

  const sanitizedName = file.name.replace(/\s+/g, '_');
  const fileName = `${pathPrefix}/${Date.now()}_${sanitizedName}`;
  
  try {
    // Convert File to Buffer
    const buffer = await file.arrayBuffer();
    
    // Upload to MinIO
    await client.putObject(
      BUCKET,
      fileName,
      Buffer.from(buffer),
      file.size,
      { 'Content-Type': file.type }
    );
    
    // Generate pre-signed URL that doesn't expire
    // For production, you might want to set a more reasonable expiry time
    const url = await client.presignedGetObject(BUCKET, fileName, 7 * 24 * 60 * 60); // 7 days
    
    return url;
  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    throw new Error('Failed to upload image to storage');
  }
};

// Delete a file from MinIO
export const deleteFile = async (fileUrl: string): Promise<void> => {
  const client = await getMinioClient();
  if (!client) {
    throw new Error('MinIO not available in production mode');
  }

  try {
    // Extract the object name from the URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const objectName = pathParts.slice(2).join('/');
    
    await client.removeObject(BUCKET, objectName);
  } catch (error) {
    console.error('Error deleting file from MinIO:', error);
    throw new Error('Failed to delete image from storage');
  }
};

// Initialize bucket on module load
initializeBucket();

export default {
  uploadFile,
  deleteFile,
  getMinioClient,
  BUCKET
};
