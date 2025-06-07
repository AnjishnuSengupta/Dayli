import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import JournalCard from '../components/ui/JournalCard';
import MoodPicker from '../components/ui/MoodPicker';
import FloatingHearts from '../components/ui/FloatingHearts';
import { Calendar, Heart, Save, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { saveJournalEntry, getJournalEntries, JournalEntry } from '@/services/journalService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loading, LoadingButton } from '@/components/ui/loading';
import { Skeleton } from '@/components/ui/skeleton';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const Journal = () => {
  const [entry, setEntry] = useState('');
  const [mood, setMood] = useState('happy');
  const [showHearts, setShowHearts] = useState(false);
  const [entryError, setEntryError] = useState<string | null>(null);
  const { toast: hookToast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Fetch journal entries with error handling
  const { data: journalEntries, isLoading, error: journalError, refetch } = useQuery({
    queryKey: ['journal-entries', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser) throw new Error("Authentication required");
      console.log("🔄 Fetching journal entries for user:", currentUser.uid);
      try {
        const entries = await getJournalEntries(currentUser.uid);
        console.log("📱 Journal entries fetched successfully:", entries.length, "entries");
        return entries;
      } catch (error) {
        console.error("❌ Failed to fetch journal entries:", error);
        toast.error("Couldn't load your journal entries");
        throw error;
      }
    },
    enabled: !!currentUser,
    refetchOnWindowFocus: true,
    staleTime: 30000, // 30 seconds
    retry: 3
  });

  // Basic debug useEffect to track user state
  useEffect(() => {
    console.log("🔍 Journal State - User:", currentUser?.uid, "Entries:", journalEntries?.length || 0);
  }, [currentUser, journalEntries]);

  // Save journal entry mutation with improved error handling
  const saveMutation = useMutation({
    mutationFn: async (journalEntry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
      if (!currentUser) throw new Error("Authentication required");
      try {
        const id = await saveJournalEntry(journalEntry);
        return id;
      } catch (error) {
        console.error("Failed to save journal entry:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch the journal entries
      queryClient.invalidateQueries({ queryKey: ['journal-entries', currentUser?.uid] });
      refetch(); // Explicit refetch to ensure immediate update
      
      toast.success("Entry saved with love 💕");
      hookToast({
        title: "Entry saved with love 💕",
        description: "Your thoughts have been preserved in your journal",
      });

      setShowHearts(true);
      setTimeout(() => {
        setShowHearts(false);
      }, 2000);
      
      // Reset form
      setEntry('');
      setEntryError(null);
    },
    onError: (error) => {
      toast.error("Failed to save your entry");
      hookToast({
        title: "Error saving entry",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  // Input validation
  const validateEntry = () => {
    if (!entry.trim()) {
      setEntryError("Please write something in your journal entry");
      return false;
    }
    
    if (entry.length < 3) {
      setEntryError("Your entry is too short");
      return false;
    }
    
    setEntryError(null);
    return true;
  };

  const saveEntry = () => {
    if (!currentUser) {
      toast.error("Please log in to save your journal entry");
      return;
    }
    
    if (!validateEntry()) return;
    
    saveMutation.mutate({
      content: entry,
      mood: mood,
      authorId: currentUser.uid,
      authorName: currentUser.displayName || 'Anonymous'
    });
  };

  const formatDate = (timestamp: unknown) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      // If it's a Firebase Timestamp, convert to JS Date
      const date = (timestamp as { toDate?: () => Date }).toDate ? 
        (timestamp as { toDate: () => Date }).toDate() : 
        new Date(timestamp as string | number | Date);
      
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid date';
    }
  };

  // Clear error when entry changes
  useEffect(() => {
    if (entryError && entry.trim().length >= 3) {
      setEntryError(null);
    }
  }, [entry, entryError]);

  return (
    <MainLayout>
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-3xl md:text-4xl font-serif mb-2">
          Journal
        </h1>
        <p className="text-gray-600 flex items-center justify-center gap-2">
          <Calendar size={16} /> {currentDate}
        </p>
      </div>
      
      <section className="mb-8">
        <JournalCard>
          <h2 className="text-xl font-serif mb-4">Write Today's Entry</h2>
          
          <div className="mb-4">
            <MoodPicker selectedMood={mood} setSelectedMood={setMood} />
          </div>
          
          <label htmlFor="journal-entry" className="sr-only">Journal Entry</label>
          <textarea
            id="journal-entry"
            className={`input-field w-full p-4 min-h-[200px] mb-2 ${entryError ? 'border-red-300' : ''}`}
            placeholder="Share your thoughts, feelings, or memorable moments from today..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          ></textarea>
          
          {entryError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{entryError}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end">
            <LoadingButton 
              onClick={saveEntry}
              loading={saveMutation.isPending}
              disabled={entry.trim().length === 0}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Save size={16} />
              {saveMutation.isPending ? 'Saving...' : 'Save Entry'}
            </LoadingButton>
          </div>
        </JournalCard>
      </section>
      
      <h2 className="text-xl font-serif mb-4">Past Entries</h2>
      
      <section className="space-y-6">
        {isLoading ? (
          <>
            <JournalCard>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-20 w-full mt-4" />
              </div>
            </JournalCard>
            <JournalCard>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-20 w-full mt-4" />
              </div>
            </JournalCard>
          </>
        ) : journalError ? (
          <JournalCard>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Failed to load journal entries. Please try refreshing the page.</AlertDescription>
            </Alert>
          </JournalCard>
        ) : journalEntries && journalEntries.length > 0 ? (
          journalEntries.map((entryData: JournalEntry) => (
            <JournalCard key={entryData.id} animated>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="text-sm text-gray-500">{formatDate(entryData.createdAt)}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <User size={14} /> <span>{entryData.authorName}</span>
                    {entryData.mood === 'happy' && <Heart size={14} className="text-journal-blush" />}
                  </div>
                </div>
              </div>
              
              <p className="whitespace-pre-line">{entryData.content}</p>
            </JournalCard>
          ))
        ) : (
          <JournalCard>
            <p className="text-center py-4">No journal entries yet. Write your first one!</p>
          </JournalCard>
        )}
      </section>
    </MainLayout>
  );
};

export default Journal;
