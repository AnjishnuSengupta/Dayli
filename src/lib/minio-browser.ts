/**
 * Browser-compatible MinIO client using fetch API
 * Falls back gracefully when MinIO is not available
 */

interface MinIOConfig {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
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
   * Upload a file using MinIO's REST API with basic authentication
   * This is a simplified approach for development environments
   */
  async uploadFile(file: File, objectName: string): Promise<string> {
    try {
      const uploadUrl = `${this.baseUrl}/${this.config.bucketName}/${objectName}`;
      
      console.log('🚀 Attempting browser MinIO upload to:', uploadUrl);
      
      // Try simple PUT request first (for public buckets)
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
        mode: 'cors' // Enable CORS
      });

      if (response.ok) {
        console.log('✅ Browser MinIO upload successful (no auth)');
        return uploadUrl;
      }

      // If that fails, try with basic auth
      const authHeader = 'Basic ' + btoa(`${this.config.accessKey}:${this.config.secretKey}`);
      
      const authResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          'Authorization': authHeader
        },
        mode: 'cors'
      });

      if (authResponse.ok) {
        console.log('✅ Browser MinIO upload successful (with basic auth)');
        return uploadUrl;
      } else {
        throw new Error(`MinIO upload failed: ${authResponse.status} ${authResponse.statusText}`);
      }
      
    } catch (error) {
      // Don't throw here - let the smart storage handle fallback
      console.warn('⚠️ Browser MinIO upload failed, will use fallback storage:', error);
      throw error;
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
      console.warn('MinIO credentials not configured, will use fallback storage');
      return null;
    }

    return new BrowserMinIOClient(config);
  } catch (error) {
    console.warn('Failed to create MinIO client, will use fallback storage:', error);
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
