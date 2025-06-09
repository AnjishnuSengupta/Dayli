/**
 * Simplified MinIO storage implementation for browser
 * This version uses direct HTTP uploads with simpler authentication
 */
import axios from 'axios';

// Storage configuration
const S3_ENDPOINT = import.meta.env.VITE_MINIO_ENDPOINT || 'play.min.io';
const USE_SSL = import.meta.env.VITE_MINIO_USE_SSL === 'true';
const PROTOCOL = USE_SSL ? 'https' : 'http';
const PORT = import.meta.env.VITE_MINIO_PORT || '9000';
const BUCKET_NAME = import.meta.env.VITE_MINIO_BUCKET_NAME || 'dayli-uploads';
const ACCESS_KEY = import.meta.env.VITE_MINIO_ACCESS_KEY || '';
const SECRET_KEY = import.meta.env.VITE_MINIO_SECRET_KEY || '';

// The full endpoint URL
const ENDPOINT_URL = `${PROTOCOL}://${S3_ENDPOINT}${PORT !== '443' && PORT !== '80' ? ':' + PORT : ''}`;

/**
 * Upload a file to MinIO using a simplified approach
 * This uses FormData with basic authentication for demo purposes
 */
export const uploadFile = async (file: File, pathPrefix: string = 'memories'): Promise<string> => {
  try {
    // Validate file
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }
    
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    const sanitizedName = file.name.replace(/\s+/g, '_');
    const fileName = `${pathPrefix}/${Date.now()}_${sanitizedName}`;
    
    console.log('Uploading to MinIO:', {
      endpoint: ENDPOINT_URL,
      bucket: BUCKET_NAME,
      file: fileName,
      size: file.size
    });

    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Use the MinIO browser upload endpoint
    const uploadUrl = `${ENDPOINT_URL}/${BUCKET_NAME}/${fileName}`;
    
    const response = await axios.put(uploadUrl, file, {
      headers: {
        'Content-Type': file.type,
        'x-amz-acl': 'public-read',
      },
      auth: {
        username: ACCESS_KEY,
        password: SECRET_KEY
      },
      timeout: 30000,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${progress}%`);
        }
      }
    });

    if (response.status >= 200 && response.status < 300) {
      const fileUrl = `${ENDPOINT_URL}/${BUCKET_NAME}/${fileName}`;
      console.log('✅ Upload successful:', fileUrl);
      return fileUrl;
    } else {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Upload error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Permission denied: Check MinIO credentials');
      } else if (error.response?.status === 404) {
        throw new Error('Bucket not found: Please create the bucket first');
      } else if (!error.response) {
        throw new Error('Network error: Cannot connect to MinIO server');
      } else {
        throw new Error(`MinIO error (${error.response.status}): ${error.message}`);
      }
    }
    
    throw error instanceof Error ? error : new Error('Unknown upload error');
  }
};

/**
 * Delete a file from MinIO
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const objectKey = pathParts.slice(2).join('/');
    
    if (!objectKey) {
      throw new Error('Invalid file URL');
    }

    await axios.delete(`${ENDPOINT_URL}/${BUCKET_NAME}/${objectKey}`, {
      auth: {
        username: ACCESS_KEY,
        password: SECRET_KEY
      }
    });
    
    console.log('✅ File deleted successfully');
  } catch (error) {
    console.error('❌ Delete error:', error);
    
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      // File already deleted, not an error
      console.log('File not found, may have been already deleted');
      return;
    }
    
    throw error instanceof Error ? error : new Error('Unknown deletion error');
  }
};
