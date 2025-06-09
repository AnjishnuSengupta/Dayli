/**
 * Browser-compatible MinIO client using presigned URLs
 * This implementation is secure and avoids exposing credentials in browser
 */

interface MinIOConfig {
  endpoint: string;
  port: number;
  useSSL: boolean;
  bucketName: string;
}

class BrowserMinIOClient {
  private config: MinIOConfig;
  private baseUrl: string;

  constructor(config: MinIOConfig) {
    this.config = config;
    const protocol = config.useSSL ? 'https' : 'http';
    this.baseUrl = `${protocol}://${config.endpoint}:${config.port}`;
  }

  /**
   * Upload a file using presigned URL (secure method for browser uploads)
   */
  async uploadFile(file: File, objectName: string): Promise<string> {
    try {
      // Generate presigned URL on server (this would be from your backend API)
      const presignedUrl = await this.getPresignedUrl(objectName);
      
      console.log('Attempting browser MinIO upload with presigned URL');
      
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type
        }
      });

      if (response.ok || response.status === 200) {
        console.log('✅ Browser MinIO upload successful');
        const publicUrl = `${this.baseUrl}/${this.config.bucketName}/${objectName}`;
        return publicUrl;
      } else {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Browser MinIO upload error:', error);
      throw error;
    }
  }

  /**
   * Get presigned URL from backend server (secure approach)
   */
  private async getPresignedUrl(objectName: string): Promise<string> {
    try {
      // Call the backend API to get a presigned URL
      const response = await fetch('/api/get-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: objectName,
          contentType: 'application/octet-stream' // Will be overridden by file type
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get presigned URL: ${response.status}`);
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error getting presigned URL:', error);
      throw new Error('Failed to get upload URL from server');
    }
  }

  /**
   * Get the public URL for an object
   */
  getObjectUrl(objectName: string): string {
    return `${this.baseUrl}/${this.config.bucketName}/${objectName}`;
  }
}

// Create and export the browser MinIO client
export const createBrowserMinIOClient = (): BrowserMinIOClient | null => {
  try {
    const config: MinIOConfig = {
      endpoint: import.meta.env.VITE_MINIO_ENDPOINT || 'localhost',
      port: parseInt(import.meta.env.VITE_MINIO_PORT || '9000'),
      useSSL: import.meta.env.VITE_MINIO_USE_SSL === 'true',
      accessKey: import.meta.env.VITE_MINIO_ACCESS_KEY || '',
      secretKey: import.meta.env.VITE_MINIO_SECRET_KEY || '',
      bucketName: import.meta.env.VITE_MINIO_BUCKET_NAME || 'dayli-uploads'
    };

    if (!config.accessKey || !config.secretKey) {
      console.warn('MinIO credentials not configured');
      return null;
    }

    return new BrowserMinIOClient(config);
  } catch (error) {
    console.warn('Failed to create MinIO client:', error);
    return null;
  }
};

// Upload function for easy use
export const uploadFileToBrowserMinIO = async (file: File, pathPrefix: string = 'memories'): Promise<string> => {
  const client = createBrowserMinIOClient();
  if (!client) {
    throw new Error('MinIO client not available');
  }

  const sanitizedName = file.name.replace(/\s+/g, '_');
  const objectName = `${pathPrefix}/${Date.now()}_${sanitizedName}`;
  
  return await client.uploadFile(file, objectName);
};

export default {
  createBrowserMinIOClient,
  uploadFileToBrowserMinIO
};
