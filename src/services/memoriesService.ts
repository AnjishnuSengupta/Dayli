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
// Import the smart storage implementation
import { uploadFile, deleteFile } from "../lib/storage-smart";

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
  
  // Upload the image to storage directly with user-specific access controls
  const imageUrl = await uploadFile(imageFile, 'memories');
  
  // Save the memory data with the image URL to Firestore
  const memoryData = {
    ...memory,
    imageUrl,
    createdAt: serverTimestamp(),
    isFavorite: false,
    tags: memory.tags || [],
    lastUpdated: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, "memories"), memoryData);
  return docRef.id;
};

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

export const toggleFavorite = async (memoryId: string, isFavorite: boolean, userId: string) => {
  try {
    // Get the memory to check ownership
    const memoryRef = doc(db, "memories", memoryId);
    const memorySnap = await getDoc(memoryRef);
    
    if (!memorySnap.exists()) {
      throw new Error('Memory not found');
    }
    
    const memoryData = memorySnap.data();
    
    // Ensure the user owns this memory
    if (memoryData.createdBy !== userId) {
      throw new Error('Unauthorized: You can only update your own memories');
    }
    
    // Update the document with proper security metadata
    await updateDoc(memoryRef, {
      isFavorite: isFavorite,
      lastUpdated: serverTimestamp()
    });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
};

export const deleteMemory = async (memoryId: string, imageUrl: string, userId: string) => {
  try {
    // First ensure this memory belongs to the user
    const memoryRef = doc(db, "memories", memoryId);
    const memorySnap = await getDoc(memoryRef);
    
    if (!memorySnap.exists()) {
      throw new Error("Memory not found");
    }
    
    const memoryData = memorySnap.data();
    if (memoryData.createdBy !== userId) {
      throw new Error("Unauthorized: You can only delete your own memories");
    }
    
    // Delete the document from Firestore
    await deleteDoc(memoryRef);
    
    // Also delete the image using the direct delete function
    await deleteFile(imageUrl);
    
    return true;
  } catch (error) {
    console.error("Error deleting memory:", error);
    throw error;
  }
};
