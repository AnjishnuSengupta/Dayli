import { useState } from 'react';
import { secureUpload, secureDelete } from '../lib/secure-storage';
import { useAuth } from '@/hooks/use-auth';

/**
 * Custom hook for secure storage operations
 * This hook enforces user authentication for all operations
 */
export const useSecureStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const { currentUser } = useAuth();

  /**
   * Securely upload a file with user authentication
   * @param file The file to upload
   * @param pathPrefix Optional folder prefix
   * @returns Promise with the URL of the uploaded file
   */
  const upload = async (file: File, pathPrefix?: string): Promise<string> => {
    if (!currentUser?.uid) {
      throw new Error('Authentication required for file uploads');
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const increment = file.size > 5 * 1024 * 1024 ? 5 : Math.random() * 15;
          const nextProgress = prev + increment;
          return nextProgress > 95 ? 95 : nextProgress;
        });
      }, 300);
      
      // Perform secure upload with user ID for access control
      const url = await secureUpload(file, pathPrefix, currentUser.uid);
      
      // Clear interval and set final progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      return url;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Upload failed'));
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Securely delete a file with user authentication
   * @param fileUrl URL of the file to delete
   * @returns Promise that resolves when deletion is complete
   */
  const remove = async (fileUrl: string): Promise<void> => {
    if (!currentUser?.uid) {
      throw new Error('Authentication required for file deletion');
    }
    
    setError(null);
    
    try {
      // Perform secure deletion with user ID for access control
      await secureDelete(fileUrl, currentUser.uid);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Delete failed'));
      throw err;
    }
  };

  return {
    upload,
    remove,
    isUploading,
    uploadProgress,
    error,
  };
};

export default useSecureStorage;
