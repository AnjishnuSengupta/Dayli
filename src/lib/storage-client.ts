
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';
import { v4 as uuidv4 } from 'uuid';

// Upload a file to Firebase Storage
export const uploadFile = async (file: File, prefix: string = 'uploads'): Promise<string> => {
  try {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${prefix}/${Date.now()}_${uuidv4()}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    
    // Upload the file
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error uploading file to Firebase Storage:', error);
    throw error;
  }
};

// Get a URL for a file
export const getFileUrl = async (fileName: string): Promise<string> => {
  try {
    const storageRef = ref(storage, fileName);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error generating download URL:', error);
    throw error;
  }
};

// Delete a file from Firebase Storage
export const deleteFile = async (fileName: string): Promise<void> => {
  try {
    const storageRef = ref(storage, fileName);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file from Firebase Storage:', error);
    throw error;
  }
};
