import { apiClient } from "./apiClient";
import { uploadImage } from "./imageService.universal";

export interface MongoMemory {
  _id?: string;
  title: string;
  date: string;
  caption: string;
  imageUrl: string;
  imageMetadata?: {
    originalName: string;
    size: number;
    mimeType: string;
  };
  createdBy: string;
  isFavorite: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const saveMemory = async (
  memory: Omit<MongoMemory, '_id' | 'createdAt' | 'updatedAt' | 'imageUrl'>, 
  imageFile: File,
  userId: string
) => {
  console.log("💾 Saving memory to MongoDB API");
  
  try {
    // Upload the image first using the universal image service
    console.log("📤 Uploading memory image...");
    const imageUrl = await uploadImage(imageFile, 'memories');
    
    const memoryData = {
      ...memory,
      imageUrl,
      imageMetadata: {
        originalName: imageFile.name,
        size: imageFile.size,
        mimeType: imageFile.type
      }
    };
    
    const response = await apiClient.post<MongoMemory>('/memories', memoryData);
    
    if (response.error) {
      console.error("❌ Error saving memory:", response.error);
      throw new Error(response.error);
    }
    
    console.log("✅ Memory saved successfully");
    return response.data!._id;
  } catch (error) {
    console.error("❌ Error in saveMemory:", error);
    throw error;
  }
};

export const getMemories = async (userId: string) => {
  console.log("🔍 Getting memories from MongoDB API for user:", userId);
  
  const response = await apiClient.get<MongoMemory[]>('/memories');
  
  if (response.error) {
    console.error("❌ Error fetching memories:", response.error);
    throw new Error(response.error);
  }
  
  const memories = response.data || [];
  console.log("✅ Successfully fetched", memories.length, "memories");
  
  // Convert string dates back to Date objects and map _id to id
  return memories.map(memory => ({
    ...memory,
    id: memory._id,
    createdAt: new Date(memory.createdAt)
  }));
};

export const updateMemory = async (memoryId: string, updates: Partial<MongoMemory>) => {
  console.log("🔄 Updating memory:", memoryId);
  
  const response = await apiClient.put<MongoMemory>(`/memories/${memoryId}`, updates);
  
  if (response.error) {
    console.error("❌ Error updating memory:", response.error);
    throw new Error(response.error);
  }
  
  console.log("✅ Memory updated successfully");
  return response.data;
};

export const deleteMemory = async (memoryId: string) => {
  console.log("🗑️ Deleting memory:", memoryId);
  
  const response = await apiClient.delete(`/memories/${memoryId}`);
  
  if (response.error) {
    console.error("❌ Error deleting memory:", response.error);
    throw new Error(response.error);
  }
  
  console.log("✅ Memory deleted successfully");
};
