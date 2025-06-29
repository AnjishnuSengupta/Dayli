// Universal Image Service - MongoDB Only
import * as mongoImageService from './imageService.mongodb';

export const uploadImage = async (file: File, pathPrefix: string = 'uploads'): Promise<string> => {
  console.log(`📤 Uploading image via MongoDB backend`);
  return mongoImageService.uploadImage(file, pathPrefix);
};

export const deleteImage = async (imageUrl: string): Promise<void> => {
  console.log(`🗑️ Deleting image via MongoDB backend`);
  return mongoImageService.deleteImage(imageUrl);
};

export const getImageData = async (imageUrl: string): Promise<string> => {
  console.log(`📷 Getting image data via MongoDB backend`);
  return mongoImageService.getImageData(imageUrl);
};
