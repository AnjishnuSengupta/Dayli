/**
 * Simple MinIO direct POST upload implementation
 * This is a simpler alternative to the AWS Signature V4 implementation
 * that uses MinIO's pre-signed POST policy instead.
 * 
 * Use this file if the AWS Signature V4 implementation has issues.
 */
import axios from 'axios';

// Storage configuration from environment variables
const S3_ENDPOINT = import.meta.env.VITE_MINIO_ENDPOINT || 'play.min.io';
const USE_SSL = import.meta.env.VITE_MINIO_USE_SSL === 'true';
const PROTOCOL = USE_SSL ? 'https' : 'http';
const PORT = import.meta.env.VITE_MINIO_PORT || '9000';
const BUCKET_NAME = import.meta.env.VITE_MINIO_BUCKET_NAME || 'dayli-data';

// The full endpoint URL
const ENDPOINT_URL = `${PROTOCOL}://${S3_ENDPOINT}:${PORT}`;

// For this method, we'll use MinIO's S3 browser-based form upload
// This simplifies the upload process and avoids complex authentication
interface UploadResponse {
  url: string;
  error?: string;
}

/**
 * Upload a file to MinIO using pre-signed URL from your backend
 * This requires a simple backend API endpoint that generates pre-signed URLs
 */
export const uploadWithPresignedUrl = async (
  file: File,
  presignedUrlEndpoint: string = '/api/get-upload-url',
  pathPrefix: string = 'memories'
): Promise<string> => {
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
    
    // Step 1: Get a pre-signed URL from your backend
    // Your backend should use MinIO SDK to generate this URL
    const urlResponse = await axios.post<UploadResponse>(presignedUrlEndpoint, {
      fileName,
      contentType: file.type
    });
    
    const { url } = urlResponse.data;
    
    if (!url) {
      throw new Error('Failed to get upload URL');
    }
    
    // Step 2: Upload directly to the pre-signed URL
    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type
      }
    });
    
    // Step 3: Return the file URL (removing query parameters)
    const fileUrl = url.split('?')[0];
    return fileUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error instanceof Error ? error : new Error('Unknown upload error');
  }
};

/**
 * IMPORTANT: This is a temporary placeholder for testing purposes
 * 
 * This function uses a public demo MinIO server for testing.
 * DO NOT use this in production - implement the presigned URL approach above.
 */
export const uploadToPublicBucket = async (
  file: File,
  pathPrefix: string = 'memories'
): Promise<string> => {
  try {
    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size exceeds 5MB limit for demo server');
    }
    
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }
    
    // For demo purposes only - using MinIO play server with anonymous upload
    const demoEndpoint = 'https://play.min.io:9000';
    const demoBucket = 'dayli-public';
    
    const sanitizedName = file.name.replace(/\s+/g, '_');
    const fileName = `${pathPrefix}/${Date.now()}_${sanitizedName}`;
    const objectKey = encodeURIComponent(fileName);
    
    console.log('Uploading to public demo bucket (for testing only)');
    
    // Simple public upload - NO AUTHENTICATION (DEMO ONLY)
    const response = await axios.put(`${demoEndpoint}/${demoBucket}/${objectKey}`, file, {
      headers: {
        'Content-Type': file.type,
        'x-amz-acl': 'public-read'
      }
    });
    
    if (response.status >= 200 && response.status < 300) {
      const fileUrl = `${demoEndpoint}/${demoBucket}/${objectKey}`;
      console.log('File uploaded successfully to demo server:', fileUrl);
      return fileUrl;
    } else {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Demo upload error:', error);
    throw error instanceof Error 
      ? new Error(`Demo upload failed: ${error.message}`) 
      : new Error('Unknown demo upload error');
  }
};

/**
 * Generate a URL for a temporary link that redirects to a file upload service
 * This is useful when you can't directly upload to MinIO from the browser
 */
export const getFileUploadServiceUrl = (
  filename: string,
  contentType: string,
  successRedirect: string,
  maxSize: number = 10485760 // 10MB
): string => {
  // This function generates a URL to a third-party service like filestack or uploadcare
  // You would need to integrate with such a service if direct uploads don't work
  
  // Example using a fictional service:
  const encodedRedirect = encodeURIComponent(successRedirect);
  const encodedFilename = encodeURIComponent(filename);
  
  return `https://upload.example.com/browser-upload?` +
    `filename=${encodedFilename}&` +
    `content_type=${encodeURIComponent(contentType)}&` +
    `max_size=${maxSize}&` +
    `success_redirect=${encodedRedirect}`;
};
