import { JournalEntry } from './journalService';

// Mock timestamp object that mimics Firebase Timestamp for localStorage compatibility
const createMockTimestamp = (date: Date) => ({
  toDate: () => date,
  toMillis: () => date.getTime(),
  seconds: Math.floor(date.getTime() / 1000),
  nanoseconds: (date.getTime() % 1000) * 1000000
});

// Local storage implementation for development/testing
export const saveJournalEntryLocal = async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
  try {
    console.log("💾 Saving journal entry to localStorage");
    
    // Get existing entries
    const existingEntries = getJournalEntriesLocal(entry.authorId);
    
    // Create new entry with timestamp
    const newEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(), // Simple ID generation
      createdAt: createMockTimestamp(new Date()) as unknown as import('firebase/firestore').Timestamp
    };
    
    // Add new entry
    const updatedEntries = [newEntry, ...existingEntries];
    
    // Save to localStorage
    const key = `journal_entries_${entry.authorId}`;
    localStorage.setItem(key, JSON.stringify(updatedEntries));
    
    console.log("✅ Journal entry saved to localStorage");
    return newEntry.id;
  } catch (error) {
    console.error("❌ Error saving journal entry to localStorage:", error);
    throw error;
  }
};

export const getJournalEntriesLocal = (userId: string): JournalEntry[] => {
  try {
    const key = `journal_entries_${userId}`;
    const stored = localStorage.getItem(key);
    
    if (!stored) {
      return [];
    }
    
    const entries: JournalEntry[] = JSON.parse(stored);
    console.log("✅ Fetched", entries.length, "entries from localStorage");
    return entries;
  } catch (error) {
    console.error("❌ Error fetching journal entries from localStorage:", error);
    return [];
  }
};
