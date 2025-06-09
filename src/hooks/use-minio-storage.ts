import { useState } from 'react';
import { uploadFile, deleteFile } from '../lib/storage-smart';

// Custom hook for handling storage operations
export const useMinioStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Upload a file to storage and get back the URL
  const upload = async (file: File, pathPrefix?: string): Promise<string> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // Implement a smarter progress simulation that depends on file size
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          // Slow down progress for larger files to provide a better user experience
          const increment = file.size > 5 * 1024 * 1024 ? 5 : Math.random() * 15;
          const nextProgress = prev + increment;
          return nextProgress > 95 ? 95 : nextProgress;
        });
      }, 300);
      
      // Upload the file
      const url = await uploadFile(file, pathPrefix);
      
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

  // Delete a file from MinIO
  const remove = async (fileUrl: string): Promise<void> => {
    setError(null);
    
    try {
      await deleteFile(fileUrl);
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

export default useMinioStorage;
