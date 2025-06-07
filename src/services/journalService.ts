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
import { saveJournalEntryLocal, getJournalEntriesLocal } from "./journalService.local";

export interface JournalEntry {
  id?: string;
  content: string;
  mood: string;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
}

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  const config = db.app.options;
  return config.projectId !== "dummy-project" && 
         config.apiKey !== "AIzaSyDummyKeyForDevelopmentOnly";
};

export const saveJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
  // Use local storage if Firebase is not properly configured
  if (!isFirebaseConfigured()) {
    console.log("🔄 Using localStorage fallback for journal storage");
    return saveJournalEntryLocal(entry);
  }

  try {
    console.log("💾 Saving journal entry to Firebase");
    
    const entryData = {
      ...entry,
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, "journal_entries"), entryData);
    console.log("✅ Journal entry saved with ID:", docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error("❌ Error saving journal entry:", error);
    throw error;
  }
};

export const getJournalEntries = async (userId: string) => {
  // Use local storage if Firebase is not properly configured
  if (!isFirebaseConfigured()) {
    console.log("🔄 Using localStorage fallback for journal retrieval");
    return getJournalEntriesLocal(userId);
  }

  try {
    console.log("🔍 Getting journal entries from Firebase for user:", userId);
    
    // Simplified query without orderBy to avoid index requirements
    const q = query(
      collection(db, "journal_entries"),
      where("authorId", "==", userId)
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
    
    // Sort manually on client side
    entries.sort((a, b) => {
      const timeA = a.createdAt?.toMillis() || 0;
      const timeB = b.createdAt?.toMillis() || 0;
      return timeB - timeA; // Descending order
    });
    
    console.log("✅ Successfully fetched", entries.length, "journal entries");
    return entries;
  } catch (error) {
    console.error("❌ Error fetching journal entries:", error);
    throw error;
  }
};
