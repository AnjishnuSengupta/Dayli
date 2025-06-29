import { apiClient } from "./apiClient";

export interface MongoJournalEntry {
  _id?: string;
  content: string;
  mood: string;
  authorId: string;
  authorName: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const saveJournalEntry = async (entry: Omit<MongoJournalEntry, '_id' | 'createdAt' | 'updatedAt' | 'authorId' | 'authorName'>) => {
  console.log("💾 Saving journal entry to MongoDB API");
  
  const response = await apiClient.post<MongoJournalEntry>('/journal', entry);
  
  if (response.error) {
    console.error("❌ Error saving journal entry:", response.error);
    throw new Error(response.error);
  }
  
  console.log("✅ Journal entry saved successfully");
  return response.data!._id;
};

export const getJournalEntries = async (userId: string) => {
  console.log("🔍 Getting journal entries from MongoDB API for user:", userId);
  
  const response = await apiClient.get<MongoJournalEntry[]>('/journal');
  
  if (response.error) {
    console.error("❌ Error fetching journal entries:", response.error);
    throw new Error(response.error);
  }
  
  const entries = response.data || [];
  console.log("✅ Successfully fetched", entries.length, "journal entries");
  
  // Convert string dates back to Date objects
  return entries.map(entry => ({
    ...entry,
    id: entry._id,
    createdAt: new Date(entry.createdAt)
  }));
};
