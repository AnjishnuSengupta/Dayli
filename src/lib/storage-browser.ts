import axios from 'axios';

// Storage configuration
const S3_ENDPOINT = import.meta.env.VITE_S3_ENDPOINT || 'https://play.min.io';
const BUCKET_NAME = import.meta.env.VITE_MINIO_BUCKET_NAME || 'dayli-data';
const REGION = import.meta.env.VITE_S3_REGION || 'us-east-1';
const ACCESS_KEY = import.meta.env.VITE_MINIO_ACCESS_KEY || '';
const SECRET_KEY = import.meta.env.VITE_MINIO_SECRET_KEY || '';

// Helper function for creating signed URLs
const getSignedUrl = (operation: 'putObject' | 'getObject', key: string, expiresIn = 3600): string => {
  // In a real implementation, you'd generate a signed URL on the server
  // For now, we'll return a direct URL to the S3-compatible storage
  // This requires your bucket to have appropriate CORS and public read policies
  
  if (operation === 'putObject') {
    return `${S3_ENDPOINT}/${BUCKET_NAME}/${key}`;
  } else {
    return `${S3_ENDPOINT}/${BUCKET_NAME}/${key}?t=${Date.now()}`;
  }
};

// Upload a file with optional path prefix
export const uploadFile = async (file: File, pathPrefix: string = 'memories'): Promise<string> => {
  try {
    const sanitizedName = file.name.replace(/\s+/g, '_');
    const fileName = `${pathPrefix}/${Date.now()}_${sanitizedName}`;
    
    // In a production app, you would typically:
    // 1. Request a pre-signed URL from your server
    // 2. Use that URL to upload directly to S3/MinIO
    
    // For this demonstration, we'll use a mock approach
    // that simulates a successful upload
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate a URL to the "uploaded" file
    const fileUrl = getSignedUrl('getObject', fileName);
    
    // In a real implementation, you'd do:
    // const uploadUrl = getSignedUrl('putObject', fileName);
    // await axios.put(uploadUrl, file, {
    //   headers: { 'Content-Type': file.type }
    // });
    
    console.log('File "uploaded" to:', fileUrl);
    return fileUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('Failed to upload image to storage');
  }
};

// Delete a file
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    // Extract the object name from the URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const objectName = pathParts.slice(1).join('/');
    
    // In a real implementation, you'd make a call to your backend to delete the file
    // For now, we'll just simulate success
    console.log('File "deleted":', objectName);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete image from storage');
  }
};

export default {
  uploadFile,
  deleteFile,
  getSignedUrl
};
