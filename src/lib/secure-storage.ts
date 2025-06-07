/**
 * Secure browser-compatible storage implementation for MinIO/S3 storage
 * This file provides a secure approach for image uploads using pre-signed URLs
 * to avoid exposing credentials in client-side code.
 */
import axios from 'axios';

// Environment variables
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '/api';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Get a list of allowed MIME types for images
 * Restricting to common safe image formats
 */
const getAllowedImageTypes = (): string[] => [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/heic',
  'image/heif'
];

/**
 * Validate file contents to ensure it's a real image
 * @param file The file to validate
 * @returns Promise<boolean> - True if the file is a valid image
 */
const validateImageContents = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    // Using Image API to verify if the file is a valid image
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      
      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsDataURL(file);
  });
};

/**
 * Securely upload a file using pre-signed URLs from the server
 * This approach never exposes S3/MinIO credentials in client-side code
 * 
 * @param file - The file to upload
 * @param pathPrefix - Optional folder path prefix (default: 'memories')
 * @param userId - The ID of the user uploading the file, used for access control
 * @returns Promise with the URL of the uploaded file
 * @throws Error if upload fails or validation fails
 */
export const secureUpload = async (
  file: File, 
  pathPrefix: string = 'memories',
  userId: string
): Promise<string> => {
  try {
    // Perform validation checks
    if (!file) {
      throw new Error('No file provided');
    }
    
    // Size validation
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }
    
    // MIME type validation
    if (!getAllowedImageTypes().includes(file.type)) {
      throw new Error('File type not allowed. Only images are permitted.');
    }
    
    // Validate file contents
    const isValidImage = await validateImageContents(file);
    if (!isValidImage) {
      throw new Error('Invalid image file');
    }
    
    // Generate a secure filename
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const secureFilename = `${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
    const fullPath = `${pathPrefix}/${secureFilename}`;
    
    // Step 1: Request a pre-signed URL from our backend API
    const presignedResponse = await axios.post(`${API_ENDPOINT}/storage/presigned-url`, {
      fileName: fullPath,
      contentType: file.type,
      userId: userId, // Pass user ID for authorization
      uploadType: pathPrefix // Pass upload type for authorization
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!presignedResponse.data || !presignedResponse.data.url) {
      throw new Error('Failed to get upload URL from server');
    }
    
    const { url: presignedUrl, fields = {}, publicUrl } = presignedResponse.data;
    
    // Step 2: Upload the file directly to the storage service
    let uploadResponse;
    
    if (Object.keys(fields).length > 0) {
      // For S3 POST policy approach
      const formData = new FormData();
      
      // Add the policy fields first
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      
      // Add the file last
      formData.append('file', file);
      
      uploadResponse = await axios.post(presignedUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });
    } else {
      // For pre-signed PUT URL approach
      uploadResponse = await axios.put(presignedUrl, file, {
        headers: {
          'Content-Type': file.type
        },
        timeout: 30000
      });
    }
    
    // Check upload success
    if (uploadResponse.status >= 200 && uploadResponse.status < 300) {
      // If the server didn't provide a public URL, extract it from the presigned URL
      if (!publicUrl) {
        const urlObj = new URL(presignedUrl);
        return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
      }
      return publicUrl;
    } else {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }
  } catch (error) {
    console.error('Secure upload error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Permission denied: Not authorized to upload this file');
      } else if (error.response?.status === 413) {
        throw new Error('File too large: The server rejected the file');
      } else if (!error.response) {
        throw new Error('Network error: Cannot connect to storage service');
      } else {
        throw new Error(`Server error (${error.response.status}): ${error.message}`);
      }
    }
    
    throw error instanceof Error ? error : new Error('Unknown upload error');
  }
};

/**
 * Securely delete a file using a server-side API call
 * @param fileUrl - The complete URL of the file to delete
 * @param userId - The ID of the user making the deletion request
 * @returns Promise that resolves when deletion is complete
 * @throws Error if deletion fails
 */
export const secureDelete = async (fileUrl: string, userId: string): Promise<void> => {
  try {
    // Extract file path from URL to send to server
    const url = new URL(fileUrl);
    const filePath = url.pathname;
    
    // Request deletion via server API
    await axios.delete(`${API_ENDPOINT}/storage/delete`, {
      data: {
        filePath,
        userId // For authorization
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Secure delete error:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Permission denied: Not authorized to delete this file');
      } else if (error.response?.status === 404) {
        // File already deleted, not a critical error
        console.log('File not found, may have been already deleted');
        return;
      }
    }
    
    throw error instanceof Error ? error : new Error('Unknown deletion error');
  }
};
