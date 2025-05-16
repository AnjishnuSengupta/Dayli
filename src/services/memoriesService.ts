
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
  deleteDoc
} from "firebase/firestore";
import { uploadFile, deleteFile } from "../lib/minio";

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
  // Upload the image to MinIO instead of Firebase Storage
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
};

export const getMemories = async () => {
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
};

export const toggleFavorite = async (memoryId: string, isFavorite: boolean) => {
  const memoryRef = doc(db, "memories", memoryId);
  await updateDoc(memoryRef, {
    isFavorite: isFavorite
  });
};

export const deleteMemory = async (memoryId: string, imageUrl: string) => {
  try {
    // Delete the document from Firestore
    await deleteDoc(doc(db, "memories", memoryId));
    
    // Also delete the image from MinIO
    await deleteFile(imageUrl);
    
    return true;
  } catch (error) {
    console.error("Error deleting memory:", error);
    throw error;
  }
};
