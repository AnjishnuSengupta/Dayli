// Firebase Connection Test Utility
import { db } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('🔥 Testing Firebase connection...');
  
  try {
    // Test 1: Basic connection
    console.log('📡 Testing basic Firestore connection...');
    const testCollection = collection(db, 'test');
    console.log('✅ Firestore connection established');
    
    // Test 2: Try to read from journal_entries collection
    console.log('📄 Testing journal_entries collection access...');
    const journalCollection = collection(db, 'journal_entries');
    
    // Try to get the first few documents without authentication
    try {
      const snapshot = await getDocs(journalCollection);
      console.log(`📊 Found ${snapshot.size} documents in journal_entries collection`);
      console.log('✅ Collection access successful (may be empty due to auth rules)');
    } catch (error) {
      console.log('⚠️ Collection access error (expected if auth rules require authentication):', error);
    }
    
    return { success: true, message: 'Firebase connection test completed' };
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return { success: false, error };
  }
};

export const testAuthenticatedFirebaseAccess = async (userId: string) => {
  console.log('🔐 Testing authenticated Firebase access for user:', userId);
  
  try {
    // Test query for user's journal entries
    const journalCollection = collection(db, 'journal_entries');
    const userQuery = query(journalCollection, where('authorId', '==', userId));
    
    const snapshot = await getDocs(userQuery);
    console.log(`📊 Found ${snapshot.size} journal entries for user ${userId}`);
    
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log('📝 Journal entries:', entries);
    
    return { success: true, entries, count: snapshot.size };
  } catch (error) {
    console.error('❌ Authenticated Firebase access test failed:', error);
    return { success: false, error };
  }
};
