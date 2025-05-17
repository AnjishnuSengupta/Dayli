# Dayli App Manual Fix Guide

After making our automated fixes for Firebase permissions and MinIO storage, here are a few manual edits you need to make to fully fix the Dayli app:

## 1. Update Dashboard.tsx

Find this code in `/home/anjishnu/Documents/Dayli/src/pages/Dashboard.tsx` around line 90:

```typescript
// Fetch recent journal entries
useEffect(() => {
  const fetchRecentEntries = async () => {
    if (!currentUser) return;
    
    setIsLoadingEntries(true);
    try {
      // Use a query to get only the 3 most recent entries
      const entriesCollection = collection(db, "journal_entries");
      const entriesQuery = query(
        entriesCollection,
        orderBy("createdAt", "desc"),
        limit(3)
      );
      
      const querySnapshot = await getDocs(entriesQuery);
      const entries: EnhancedJournalEntry[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<JournalEntry, 'id'>;
        const contentPreview = data.content.length > 80 
          ? data.content.substring(0, 80) + '...' 
          : data.content;
          
        entries.push({
          id: doc.id,
          ...data,
          excerpt: contentPreview
        });
      });
      
      setRecentEntries(entries);
    } catch (error) {
      console.error("Error fetching recent entries:", error);
    } finally {
      setIsLoadingEntries(false);
    }
  };
  
  fetchRecentEntries();
}, [currentUser]);
```

Replace it with:

```typescript
// Fetch recent journal entries
useEffect(() => {
  const fetchRecentEntries = async () => {
    if (!currentUser) return;
    
    setIsLoadingEntries(true);
    try {
      // Use the service function to get entries with proper filtering
      const allEntries = await getJournalEntries(currentUser.uid);
      
      // Get only the 3 most recent entries
      const recentEntries: EnhancedJournalEntry[] = allEntries.slice(0, 3).map(entry => {
        // Create excerpt
        const contentPreview = entry.content.length > 80 
          ? entry.content.substring(0, 80) + '...' 
          : entry.content;
          
        return {
          ...entry,
          excerpt: contentPreview
        };
      });
      
      setRecentEntries(recentEntries);
    } catch (error) {
      console.error("Error fetching recent entries:", error);
      toast({
        title: "Error",
        description: "Could not load your journal entries",
        variant: "destructive"
      });
    } finally {
      setIsLoadingEntries(false);
    }
  };
  
  fetchRecentEntries();
}, [currentUser, toast]);
```

## 2. Update Memories Fetching in Dashboard

Find this code in `/home/anjishnu/Documents/Dayli/src/pages/Dashboard.tsx`:

```typescript
// Fetch recent memories
useEffect(() => {
  const fetchRecentMemories = async () => {
    if (!currentUser) return;
    
    setIsLoadingMemories(true);
    try {
      // Use a query to get only the 4 most recent memories
      const memoriesCollection = collection(db, "memories");
      const memoriesQuery = query(
        memoriesCollection,
        orderBy("createdAt", "desc"),
        limit(4)
      );
      
      const querySnapshot = await getDocs(memoriesQuery);
      const memories: Memory[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<Memory, 'id'>;
        memories.push({
          id: doc.id,
          ...data
        });
      });
      
      setRecentMemories(memories);
    } catch (error) {
      console.error("Error fetching recent memories:", error);
    } finally {
      setIsLoadingMemories(false);
    }
  };
  
  fetchRecentMemories();
}, [currentUser]);
```

Replace it with:

```typescript
// Fetch recent memories
useEffect(() => {
  const fetchRecentMemories = async () => {
    if (!currentUser) return;
    
    setIsLoadingMemories(true);
    try {
      // Use the service function to get memories with proper filtering
      const allMemories = await getMemories(currentUser.uid);
      
      // Get only the 4 most recent memories
      const recentMemories = allMemories.slice(0, 4);
      
      setRecentMemories(recentMemories);
    } catch (error) {
      console.error("Error fetching recent memories:", error);
      toast({
        title: "Error",
        description: "Could not load your memories",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMemories(false);
    }
  };
  
  fetchRecentMemories();
}, [currentUser, toast]);
```

## 3. Ensure Your MinIO Account is Set Up

1. Make sure the bucket `dayli-data` exists in your MinIO instance
2. Check that your user account (anjishnu) has proper permissions to write to that bucket
3. Set CORS policy for the bucket to allow requests from your app

## 4. Upload Firebase Rules

Make sure to copy the contents of `firebase.rules` file to your Firebase Console:
1. Go to the Firebase Console
2. Select your project (dayli-com)
3. Go to Firestore Database -> Rules
4. Replace the existing rules with the ones from your `firebase.rules` file
5. Do the same for Storage -> Rules

These changes should fix the issues with creating journals and memories in your app.
