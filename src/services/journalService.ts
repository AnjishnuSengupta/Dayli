
import { db } from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp, 
  orderBy,
  Timestamp
} from "firebase/firestore";

export interface JournalEntry {
  id?: string;
  content: string;
  mood: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
}

export const saveJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
  const entryData = {
    ...entry,
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, "journal_entries"), entryData);
  return docRef.id;
};

export const getJournalEntries = async (userId: string) => {
  const q = query(
    collection(db, "journal_entries"),
    orderBy("createdAt", "desc")
  );
  
  const querySnapshot = await getDocs(q);
  
  const entries: JournalEntry[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data() as Omit<JournalEntry, 'id'>;
    entries.push({
      id: doc.id,
      ...data
    });
  });
  
  return entries;
};
