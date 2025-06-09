/**
 * Fallback storage system for development
 * Uses IndexedDB when MinIO is not available
 */

interface StoredFile {
  id: string;
  name: string;
  data: string; // base64
  type: string;
  uploadDate: number;
}

class FallbackStorage {
  private dbName = 'DayliStorage';
  private version = 1;
  private storeName = 'files';

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async uploadFile(file: File, pathPrefix: string = 'memories'): Promise<string> {
    try {
      // Convert file to base64
      const base64 = await this.fileToBase64(file);
      
      const fileId = `${pathPrefix}_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const storedFile: StoredFile = {
        id: fileId,
        name: file.name,
        data: base64,
        type: file.type,
        uploadDate: Date.now()
      };

      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.add(storedFile);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      // Return a local URL
      const url = `fallback://storage/${fileId}`;
      console.log('✅ File stored in fallback storage:', url);
      return url;
    } catch (error) {
      console.error('❌ Fallback storage error:', error);
      throw new Error('Failed to store file locally');
    }
  }

  async getFile(fileId: string): Promise<string | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const storedFile = await new Promise<StoredFile>((resolve, reject) => {
        const request = store.get(fileId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      return storedFile ? storedFile.data : null;
    } catch (error) {
      console.error('❌ Error retrieving file:', error);
      return null;
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      await new Promise((resolve, reject) => {
        const request = store.delete(fileId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      console.log('✅ File deleted from fallback storage');
    } catch (error) {
      console.error('❌ Error deleting file:', error);
      throw new Error('Failed to delete file from local storage');
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}

// Smart storage that tries MinIO first, falls back to local storage
export const uploadFile = async (file: File, pathPrefix: string = 'memories'): Promise<string> => {
  // Try MinIO first
  try {
    const { uploadFile: minioUpload } = await import('./storage-simple');
    return await minioUpload(file, pathPrefix);
  } catch (minioError) {
    console.log('MinIO not available, using fallback storage:', minioError);
    
    // Fall back to local storage
    const fallback = new FallbackStorage();
    return await fallback.uploadFile(file, pathPrefix);
  }
};

export const deleteFile = async (fileUrl: string): Promise<void> => {
  if (fileUrl.startsWith('fallback://')) {
    // Handle fallback storage deletion
    const fileId = fileUrl.replace('fallback://storage/', '');
    const fallback = new FallbackStorage();
    return await fallback.deleteFile(fileId);
  } else {
    // Handle MinIO deletion
    try {
      const { deleteFile: minioDelete } = await import('./storage-simple');
      return await minioDelete(fileUrl);
    } catch (error) {
      console.error('Failed to delete from MinIO:', error);
      throw error;
    }
  }
};

// Helper to get file data for display
export const getFileData = async (fileUrl: string): Promise<string | null> => {
  if (fileUrl.startsWith('fallback://')) {
    const fileId = fileUrl.replace('fallback://storage/', '');
    const fallback = new FallbackStorage();
    return await fallback.getFile(fileId);
  } else {
    // For MinIO URLs, return as-is (they're public URLs)
    return fileUrl;
  }
};

// Make available globally for testing
declare global {
  interface Window {
    testFallbackStorage: () => Promise<string | null>;
  }
}

window.testFallbackStorage = async () => {
  const fallback = new FallbackStorage();
  
  // Create a test file
  const testContent = 'Hello World!';
  const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });
  
  try {
    const url = await fallback.uploadFile(testFile, 'test');
    console.log('✅ Fallback storage test successful:', url);
    return url;
  } catch (error) {
    console.error('❌ Fallback storage test failed:', error);
    return null;
  }
};
