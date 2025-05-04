
import { db, storage } from "../lib/firebase";
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
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
  // First upload the image to Firebase Storage
  const storageRef = ref(storage, `memories/${Date.now()}_${imageFile.name}`);
  const uploadResult = await uploadBytes(storageRef, imageFile);
  
  // Get the download URL
  const imageUrl = await getDownloadURL(uploadResult.ref);
  
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
