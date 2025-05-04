
import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import JournalCard from '../components/ui/JournalCard';
import MoodPicker from '../components/ui/MoodPicker';
import FloatingHearts from '../components/ui/FloatingHearts';
import { Calendar, Heart, Save, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { saveJournalEntry, getJournalEntries, JournalEntry } from '@/services/journalService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Journal = () => {
  const [entry, setEntry] = useState('');
  const [mood, setMood] = useState('happy');
  const [showHearts, setShowHearts] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Fetch journal entries
  const { data: journalEntries, isLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: () => currentUser ? getJournalEntries(currentUser.uid) : Promise.resolve([]),
    enabled: !!currentUser
  });

  // Save journal entry mutation
  const saveMutation = useMutation({
    mutationFn: saveJournalEntry,
    onSuccess: () => {
      // Invalidate and refetch the journal entries
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
      
      toast({
        title: "Entry saved with love 💕",
        description: "Your thoughts have been preserved in your journal",
      });

      setShowHearts(true);
      setTimeout(() => {
        setShowHearts(false);
      }, 2000);
      
      // Reset form
      setEntry('');
    },
    onError: (error) => {
      toast({
        title: "Error saving entry",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  const saveEntry = () => {
    if (!entry.trim() || !currentUser) return;
    
    saveMutation.mutate({
      content: entry,
      mood: mood,
      authorId: currentUser.uid,
      authorName: currentUser.displayName || 'Anonymous'
    });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    
    // If it's a Firebase Timestamp, convert to JS Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <MainLayout>
      {showHearts && <FloatingHearts count={7} />}
      
      <section className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-serif mb-2">
          Journal
        </h1>
        <p className="text-gray-600 flex items-center justify-center gap-2">
          <Calendar size={16} /> {currentDate}
        </p>
      </section>
      
      <section className="mb-8">
        <JournalCard>
          <h2 className="text-xl font-serif mb-4">Write Today's Entry</h2>
          
          <div className="mb-4">
            <MoodPicker selectedMood={mood} setSelectedMood={setMood} />
          </div>
          
          <label htmlFor="journal-entry" className="sr-only">Journal Entry</label>
          <textarea
            id="journal-entry"
            className="input-field w-full p-4 min-h-[200px] mb-4"
            placeholder="Share your thoughts, feelings, or memorable moments from today..."
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
          ></textarea>
          
          <div className="flex justify-end">
            <button 
              onClick={saveEntry}
              className="btn-primary inline-flex items-center gap-2"
              disabled={entry.trim().length === 0 || saveMutation.isPending}
            >
              <Save size={16} />
              {saveMutation.isPending ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </JournalCard>
      </section>
      
      <h2 className="text-xl font-serif mb-4">Past Entries</h2>
      
      <section className="space-y-6">
        {isLoading ? (
          <JournalCard>
            <p className="text-center py-4">Loading entries...</p>
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
