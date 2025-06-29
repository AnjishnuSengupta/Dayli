// MongoDB-only imports
import {
  saveMemory as saveMemoryMongoDB,
  getMemories as getMemoriesMongoDB,
  updateMemory as updateMemoryMongoDB,
  deleteMemory as deleteMemoryMongoDB,
  MongoMemory
} from './memoriesService.mongodb';

// Unified interface
export interface UniversalMemory {
  id?: string;
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
}

export const saveMemory = async (
  memory: Omit<UniversalMemory, 'id' | '_id' | 'createdAt' | 'imageUrl'>, 
  imageFile: File,
  userId: string
): Promise<string> => {
  console.log('💾 Using MongoDB for memory');
  return await saveMemoryMongoDB(memory, imageFile, userId);
};

export const getMemories = async (userId: string): Promise<UniversalMemory[]> => {
  console.log('📷 Fetching memories from MongoDB');
  const memories = await getMemoriesMongoDB(userId);
  
  // Convert MongoDB format to universal format
  return memories.map(memory => ({
    ...memory,
    id: memory._id,
    createdAt: new Date(memory.createdAt)
  }));
};

export const updateMemory = async (
  memoryId: string, 
  updates: Partial<UniversalMemory>
): Promise<UniversalMemory> => {
  console.log('🔄 Updating memory in MongoDB');
  return await updateMemoryMongoDB(memoryId, updates);
};

export const deleteMemory = async (
  memoryId: string, 
  imageUrl?: string, 
  userId?: string
): Promise<void> => {
  console.log('🗑️ Deleting memory from MongoDB');
  return await deleteMemoryMongoDB(memoryId);
};

// For backward compatibility
export const toggleFavorite = async (memoryId: string, isFavorite: boolean) => {
  return await updateMemory(memoryId, { isFavorite });
};

export type Memory = UniversalMemory;
