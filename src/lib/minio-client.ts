
import { Client } from 'minio';
import { v4 as uuidv4 } from 'uuid';

// Default MinIO configuration for development
const defaultConfig = {
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
  bucket: 'dailyjournal'
};

// MinIO configuration from environment variables (if available)
const minioConfig = {
  endPoint: import.meta.env.VITE_MINIO_ENDPOINT || defaultConfig.endPoint,
  port: parseInt(import.meta.env.VITE_MINIO_PORT || defaultConfig.port.toString()),
  useSSL: import.meta.env.VITE_MINIO_USE_SSL === 'true' || defaultConfig.useSSL,
  accessKey: import.meta.env.VITE_MINIO_ACCESS_KEY || defaultConfig.accessKey,
  secretKey: import.meta.env.VITE_MINIO_SECRET_KEY || defaultConfig.secretKey,
  bucket: import.meta.env.VITE_MINIO_BUCKET || defaultConfig.bucket
};

// Initialize MinIO client
const minioClient = new Client({
  endPoint: minioConfig.endPoint,
  port: minioConfig.port,
  useSSL: minioConfig.useSSL,
  accessKey: minioConfig.accessKey,
  secretKey: minioConfig.secretKey
});

// Function to initialize the bucket if it doesn't exist
export const initializeBucket = async () => {
  try {
    const exists = await minioClient.bucketExists(minioConfig.bucket);
    if (!exists) {
      await minioClient.makeBucket(minioConfig.bucket, 'us-east-1');
      console.log(`Bucket '${minioConfig.bucket}' created successfully.`);
    } else {
      console.log(`Bucket '${minioConfig.bucket}' already exists.`);
    }
  } catch (error) {
    console.error('Error initializing MinIO bucket:', error);
  }
};

// Upload a file to MinIO
export const uploadFile = async (file: File, prefix: string = 'uploads'): Promise<string> => {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${prefix}/${Date.now()}_${uuidv4()}.${fileExtension}`;
    
    // Convert File to Buffer for upload
    const buffer = await file.arrayBuffer();
    
    await minioClient.putObject(
      minioConfig.bucket,
      fileName,
      Buffer.from(buffer),
      file.size,
      { 'Content-Type': file.type }
    );
    
    // Generate a presigned URL for the uploaded object
    const url = await minioClient.presignedGetObject(minioConfig.bucket, fileName, 24 * 60 * 60); // 24-hour expiry
    return url;
  } catch (error) {
    console.error('Error uploading file to MinIO:', error);
    throw error;
  }
};

// Get a presigned URL for a file
export const getFileUrl = async (fileName: string): Promise<string> => {
  try {
    return await minioClient.presignedGetObject(minioConfig.bucket, fileName, 24 * 60 * 60);
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

// Delete a file from MinIO
export const deleteFile = async (fileName: string): Promise<void> => {
  try {
    await minioClient.removeObject(minioConfig.bucket, fileName);
  } catch (error) {
    console.error('Error deleting file from MinIO:', error);
    throw error;
  }
};

export default minioClient;
