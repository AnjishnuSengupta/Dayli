import { db } from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  orderBy,
  Timestamp,
  updateDoc,
  doc,
  deleteDoc,
  getDoc
} from "firebase/firestore";
// Import the secure storage implementation
import { secureUpload, secureDelete } from "../lib/secure-storage";
import { useAuth } from '@/contexts/AuthContext';

export interface Memory {
  id?: string;
  title: string;
  date: string;
  caption: string;
  imageUrl: string;
  createdBy: string;
  createdAt: Timestamp;
  isFavorite?: boolean;
  tags?: string[];
}

/**
 * Save a new memory securely with proper access control
 * @param memory The memory data
 * @param imageFile The image file to upload
 * @param userId The userId for access control
 * @returns Promise with the new memory ID
 */
export const saveMemory = async (
  memory: Omit<Memory, 'id' | 'createdAt' | 'imageUrl'>, 
  imageFile: File,
  userId: string
) => {
  // Ensure the user is authorized to create this memory
  if (memory.createdBy !== userId) {
    throw new Error('Unauthorized: You can only create memories for yourself');
  }
  
  // Additional security validations
  if (!memory.title.trim() || !memory.date.trim() || !memory.caption.trim()) {
    throw new Error('Invalid memory: All fields must be filled out');
  }
  
  // Validate the date format
  const dateRegex = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2},\s\d{4}$/;
  if (!dateRegex.test(memory.date)) {
    throw new Error('Invalid date format: Please use Month Day, Year (e.g., January 1, 2023)');
  }
  
  // Upload the image to storage securely
  // This uses the server-side authorization approach
  const imageUrl = await secureUpload(imageFile, 'memories', userId);
  
  // Save the memory data with the image URL to Firestore
  const memoryData = {
    ...memory,
    imageUrl,
    createdAt: serverTimestamp(),
    isFavorite: false,
    // Add any other security metadata needed
    lastUpdated: serverTimestamp(),
    tags: memory.tags || []
  };
  
  try {
    const docRef = await addDoc(collection(db, "memories"), memoryData);
    return docRef.id;
  } catch (error) {
    // If Firestore save fails, attempt to clean up the uploaded image
    try {
      await secureDelete(imageUrl, userId);
    } catch (deleteError) {
      console.error('Failed to clean up image after Firestore error:', deleteError);
    }
    
    throw error;
  }
};

/**
 * Get memories for a specific user with proper access control
 * @param userId The ID of the user whose memories to fetch
 * @returns Promise with an array of memories
 */
export const getMemories = async (userId: string) => {
  try {
    // Filter by createdBy to ensure permission and relevance
    const q = query(
      collection(db, "memories"),
      where("createdBy", "==", userId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    const memories: Memory[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Omit<Memory, 'id'>;
      memories.push({
        id: doc.id,
        ...data
      });
    });
    
    return memories;
  } catch (error) {
    console.error("Error fetching memories:", error);
    throw error;
  }
};

/**
 * Get memories with specific tags
 * @param userId The user ID for access control
 * @param tags Array of tags to filter by
 * @returns Promise with filtered memories
 */
export const getMemoriesByTags = async (userId: string, tags: string[]) => {
  try {
    if (!tags || tags.length === 0) {
      return getMemories(userId);
    }
    
    // Create queries for each tag (since array-contains can only check one value)
    const queries = tags.map(tag => 
      query(
        collection(db, "memories"),
        where("createdBy", "==", userId),
        where("tags", "array-contains", tag),
        orderBy("createdAt", "desc")
      )
    );
    
    // Execute all queries
    const querySnapshots = await Promise.all(queries.map(q => getDocs(q)));
    
    // Create a map to deduplicate memories that might appear in multiple queries
    const memoriesMap: Record<string, Memory> = {};
    
    querySnapshots.forEach(snapshot => {
      snapshot.forEach(doc => {
        if (!memoriesMap[doc.id]) {
          const data = doc.data() as Omit<Memory, 'id'>;
          memoriesMap[doc.id] = {
            id: doc.id,
            ...data
          };
        }
      });
    });
    
    // Convert map back to array and sort by createdAt
    return Object.values(memoriesMap).sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || 0;
      const timeB = b.createdAt?.toMillis() || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching memories by tags:", error);
    throw error;
  }
};

/**
 * Toggle favorite status of a memory
 * @param memoryId The ID of the memory to update
 * @param isFavorite The new favorite status
 * @param userId The user ID for access control
 */
export const toggleFavorite = async (
  memoryId: string, 
  isFavorite: boolean,
  userId: string
) => {
  try {
    // Get the memory to check ownership
    const memoryRef = doc(db, "memories", memoryId);
    const memoryDoc = await getDoc(memoryRef);
    
    if (!memoryDoc.exists()) {
      throw new Error('Memory not found');
    }
    
    const memoryData = memoryDoc.data();
    
    // Ensure the user owns this memory
    if (memoryData.createdBy !== userId) {
      throw new Error('Unauthorized: You can only update your own memories');
    }
    
    // Update the document
    await updateDoc(memoryRef, {
      isFavorite: isFavorite,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
};

/**
 * Delete a memory and its associated image
 * @param memoryId The ID of the memory to delete
 * @param imageUrl The URL of the image to delete
 * @param userId The user ID for access control
 * @returns Promise<boolean> True if successful
 */
export const deleteMemory = async (
  memoryId: string, 
  imageUrl: string,
  userId: string
) => {
  try {
    // Get the memory to check ownership
    const memoryRef = doc(db, "memories", memoryId);
    const memoryDoc = await getDoc(memoryRef);
    
    if (!memoryDoc.exists()) {
      throw new Error('Memory not found');
    }
    
    const memoryData = memoryDoc.data();
    
    // Ensure the user owns this memory
    if (memoryData.createdBy !== userId) {
      throw new Error('Unauthorized: You can only delete your own memories');
    }
    
    // Verify the image URL matches what's stored in the document
    if (memoryData.imageUrl !== imageUrl) {
      throw new Error('Image URL mismatch: Possible tampering detected');
    }
    
    // Delete the document from Firestore
    await deleteDoc(memoryRef);
    
    // Also delete the image from storage
    await secureDelete(imageUrl, userId);
    
    return true;
  } catch (error) {
    console.error("Error deleting memory:", error);
    throw error;
  }
};
