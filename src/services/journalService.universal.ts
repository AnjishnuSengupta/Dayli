// MongoDB-only imports
import {
  saveJournalEntry as saveJournalEntryMongoDB,
  getJournalEntries as getJournalEntriesMongoDB,
  MongoJournalEntry
} from './journalService.mongodb';

// Unified interface
export interface UniversalJournalEntry {
  id?: string;
  _id?: string;
  content: string;
  mood: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  tags?: string[];
}

export const saveJournalEntry = async (entry: Omit<UniversalJournalEntry, 'id' | '_id' | 'createdAt' | 'authorId' | 'authorName'>) => {
  console.log('📝 Using MongoDB for journal entry');
  return await saveJournalEntryMongoDB(entry);
};

export const getJournalEntries = async (userId: string): Promise<UniversalJournalEntry[]> => {
  console.log('📖 Fetching journal entries from MongoDB');
  const entries = await getJournalEntriesMongoDB(userId);
  return entries.map(entry => ({
    ...entry,
    id: entry._id || entry.id,
    createdAt: new Date(entry.createdAt)
  }));
};
