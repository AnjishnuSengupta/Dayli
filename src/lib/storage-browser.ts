/**
 * Browser-compatible storage implementation for MinIO/S3 storage
 * This file provides functions to upload and delete files from MinIO storage
 * without requiring the MinIO client library which is not compatible with browsers.
 */
import axios from 'axios';
import * as CryptoJS from 'crypto-js';

// Storage configuration
const S3_ENDPOINT = import.meta.env.VITE_MINIO_ENDPOINT || 'play.min.io';
const USE_SSL = import.meta.env.VITE_MINIO_USE_SSL === 'true';
const PROTOCOL = USE_SSL ? 'https' : 'http';
const PORT = import.meta.env.VITE_MINIO_PORT || '9000';
const BUCKET_NAME = import.meta.env.VITE_MINIO_BUCKET_NAME || 'dayli-data';
const ACCESS_KEY = import.meta.env.VITE_MINIO_ACCESS_KEY || 'anjishnu';
const SECRET_KEY = import.meta.env.VITE_MINIO_SECRET_KEY || 'Anjishnu0035';
const REGION = 'us-east-1'; // Default region for MinIO

// The full endpoint URL
const ENDPOINT_URL = `${PROTOCOL}://${S3_ENDPOINT}:${PORT}`;

/**
 * Generate AWS Signature V4 for S3/MinIO authentication
 */
function generateAWSSignatureV4(method: string, path: string, queryParams: Record<string, string>, 
                               headers: Record<string, string>, payload: File | string | null, service = 's3') {
  // Step 1: Create canonical request
  const requestDate = new Date();
  const amzDate = requestDate.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.substring(0, 8);
  
  // Add required headers
  headers['x-amz-date'] = amzDate;
  
  // Handle different payload types for hashing
  let payloadForHash = '';
  if (payload instanceof File) {
    // For file uploads, we use UNSIGNED-PAYLOAD for simplicity
    headers['x-amz-content-sha256'] = 'UNSIGNED-PAYLOAD';
  } else {
    payloadForHash = payload || '';
    headers['x-amz-content-sha256'] = CryptoJS.SHA256(payloadForHash).toString();
  }
  
  // Create canonical query string
  const canonicalQueryString = Object.keys(queryParams)
    .sort()
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
    .join('&');
  
  // Create canonical headers
  const canonicalHeaders = Object.keys(headers)
    .sort()
    .map(key => `${key.toLowerCase()}:${headers[key]}`)
    .join('\n') + '\n';
  
  // Create signed headers
  const signedHeaders = Object.keys(headers)
    .sort()
    .map(key => key.toLowerCase())
    .join(';');
  
  // Create canonical request
  const canonicalRequest = [
    method,
    path,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    headers['x-amz-content-sha256']
  ].join('\n');
  
  // Step 2: Create string to sign
  const algorithm = 'AWS4-HMAC-SHA256';
  const scope = `${dateStamp}/${REGION}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    scope,
    CryptoJS.SHA256(canonicalRequest).toString()
  ].join('\n');
  
  // Step 3: Calculate signature
  const kDate = CryptoJS.HmacSHA256(dateStamp, 'AWS4' + SECRET_KEY);
  const kRegion = CryptoJS.HmacSHA256(REGION, kDate);
  const kService = CryptoJS.HmacSHA256(service, kRegion);
  const kSigning = CryptoJS.HmacSHA256('aws4_request', kService);
  const signature = CryptoJS.HmacSHA256(stringToSign, kSigning).toString();
  
  // Step 4: Create authorization header
  const authorizationHeader = `${algorithm} Credential=${ACCESS_KEY}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  
  return authorizationHeader;
}

/**
 * Uploads a file to MinIO storage
 * @param file - The file to upload
 * @param pathPrefix - Optional folder path prefix (default: 'memories')
 * @returns Promise with the URL of the uploaded file
 * @throws Error if upload fails
 */

// Upload a file with optional path prefix
export const uploadFile = async (file: File, pathPrefix: string = 'memories'): Promise<string> => {
  try {
    // Validate file size and type
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('File size exceeds 10MB limit');
    }
    
    // Ensure only images are uploaded
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }
    
    const sanitizedName = file.name.replace(/\s+/g, '_');
    const fileName = `${pathPrefix}/${Date.now()}_${sanitizedName}`;
    const objectKey = fileName;
    const encodedObjectKey = encodeURIComponent(objectKey);
    
    console.log('Uploading file to MinIO:', {
      endpoint: ENDPOINT_URL,
      bucket: BUCKET_NAME,
      fileName: encodedObjectKey
    });
    
    // Generate AWS Signature v4 authentication
    const host = `${S3_ENDPOINT}:${PORT}`;
    const path = `/${BUCKET_NAME}/${objectKey}`;
    const requestHeaders = {
      'Host': host,
      'Content-Type': file.type,
      'x-amz-acl': 'public-read',
      'x-amz-meta-original-filename': sanitizedName
    };
    
    const authorizationHeader = generateAWSSignatureV4('PUT', path, {}, requestHeaders, file);
    
    // Upload to MinIO with AWS Signature v4 authentication
    const response = await axios.put(`${ENDPOINT_URL}/${BUCKET_NAME}/${encodedObjectKey}`, file, {
      headers: { 
        ...requestHeaders,
        'Authorization': authorizationHeader,
        'Cache-Control': 'max-age=31536000'
      },
      // Add timeout and ensure we get proper error information
      timeout: 30000
    });
    
    // If response is successful, return the URL to the file
    if (response.status >= 200 && response.status < 300) {
      // Generate URL to the uploaded file
      const fileUrl = `${ENDPOINT_URL}/${BUCKET_NAME}/${encodedObjectKey}`;
      console.log('File uploaded successfully:', fileUrl);
      return fileUrl;
    } else {
      console.error('Upload failed with status:', response.status, response.data);
      throw new Error(`Upload failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('Upload error details:', error);
    
    if (axios.isAxiosError(error)) {
      console.error("Storage error details:", error.response?.data);
      if (error.response?.status === 403) {
        throw new Error('Permission denied: Cannot upload file (authentication failed)');
      } else if (error.response?.status === 404) {
        throw new Error('Bucket not found: Please check your storage configuration');
      } else if (error.response?.status === 400) {
        throw new Error('Bad request: Improperly formatted request to MinIO server');
      } else if (!error.response) {
        throw new Error('Network error: Cannot connect to storage service');
      } else {
        throw new Error(`MinIO error (${error.response.status}): ${error.message}`);
      }
    }
    
    throw error instanceof Error ? error : new Error('Unknown upload error');
  }
};

/**
 * Deletes a file from MinIO storage
 * @param fileUrl - The complete URL of the file to delete
 * @returns Promise that resolves when deletion is complete
 * @throws Error if deletion fails
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    // Validate the URL
    if (!fileUrl || !fileUrl.includes(BUCKET_NAME)) {
      throw new Error('Invalid file URL');
    }
    
    // Extract the object key from the URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    // Skip the first empty string and the bucket name
    const objectKey = pathParts.slice(2).join('/');
    
    if (!objectKey) {
      throw new Error('Invalid file path');
    }
    
    console.log('Deleting file from MinIO:', {
      endpoint: ENDPOINT_URL,
      bucket: BUCKET_NAME,
      objectKey: objectKey
    });
    
    // Generate AWS Signature v4 authentication
    const host = `${S3_ENDPOINT}:${PORT}`;
    const path = `/${BUCKET_NAME}/${objectKey}`;
    const requestHeaders = {
      'Host': host
    };
    
    const authorizationHeader = generateAWSSignatureV4('DELETE', path, {}, requestHeaders, '');
    
    // Delete the file from storage
    await axios.delete(`${ENDPOINT_URL}/${BUCKET_NAME}/${objectKey}`, {
      headers: {
        ...requestHeaders,
        'Authorization': authorizationHeader
      }
    });
    
    console.log('File deleted successfully');
  } catch (error) {
    console.error('Delete error details:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Permission denied: Cannot delete file');
      } else if (error.response?.status === 404) {
        // File already deleted or doesn't exist, not a critical error
        console.log('File not found, may have been already deleted');
        return;
      }
    }
    throw error instanceof Error ? error : new Error('Unknown deletion error');
  }
};
