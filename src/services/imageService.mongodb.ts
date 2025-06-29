import { apiClient } from './apiClient';

export interface ImageUploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

export const uploadImage = async (file: File, pathPrefix: string = 'uploads'): Promise<string> => {
  console.log(`📤 Uploading image via MongoDB API: ${file.name}`);
  
  try {
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('image', file);
    formData.append('pathPrefix', pathPrefix);

    // Make API call using fetch directly (since apiClient expects JSON)
    const token = localStorage.getItem('auth_token');
    const response = await fetch('/api/upload/image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const data: ImageUploadResponse = await response.json();
    
    console.log('✅ Image uploaded successfully:', data.filename);
    return data.url;
  } catch (error) {
    console.error('❌ Image upload failed:', error);
    throw error;
  }
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  console.log('🗑️ Deleting image via MongoDB API:', imageUrl);
  
  // For base64 images stored in MongoDB, deletion is not needed
  // since they're stored directly in the database documents
  console.log('✅ Image deletion not required for base64 storage');
};

export const getImageData = async (imageUrl: string): Promise<string> => {
  console.log(`📷 Fetching image data: ${imageUrl}`);
  
  try {
    // If it's already a data URL, return it directly
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    // If it's a persistent image URL, fetch the data
    if (imageUrl.startsWith('/api/images/')) {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const imageData = await response.json() as { data: string; filename: string; mimetype: string; size: number };
      return imageData.data; // The base64 data
    }
    
    // For external URLs, return as-is
    return imageUrl;
  } catch (error) {
    console.error('Error fetching image data:', error);
    throw new Error('Failed to fetch image data');
  }
};
