
import { db } from "../lib/firebase";
import { uploadFile } from "../lib/minio-client";
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
  doc
} from "firebase/firestore";

export interface Memory {
  id?: string;
  title: string;
  date: string;
  caption: string;
  imageUrl: string;
  createdBy: string;
  createdAt: Timestamp;
  isFavorite?: boolean;
}

export const saveMemory = async (
  memory: Omit<Memory, 'id' | 'createdAt' | 'imageUrl'>, 
  imageFile: File
) => {
  try {
    // First upload the image to MinIO
    const imageUrl = await uploadFile(imageFile, 'memories');
    
    // Save the memory data with the image URL to Firestore
    const memoryData = {
      ...memory,
      imageUrl,
      createdAt: serverTimestamp(),
      isFavorite: false
    };
    
    const docRef = await addDoc(collection(db, "memories"), memoryData);
    return docRef.id;
  } catch (error) {
    console.error('Error saving memory:', error);
    throw error;
  }
};

export const getMemories = async () => {
  try {
    const q = query(
      collection(db, "memories"),
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
    console.error('Error retrieving memories:', error);
    throw error;
  }
};

export const toggleFavorite = async (memoryId: string, isFavorite: boolean) => {
  try {
    const memoryRef = doc(db, "memories", memoryId);
    await updateDoc(memoryRef, {
      isFavorite: isFavorite
    });
  } catch (error) {
    console.error('Error toggling favorite status:', error);
    throw error;
  }
};
