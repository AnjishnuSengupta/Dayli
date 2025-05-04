
import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import JournalCard from '../components/ui/JournalCard';
import MoodPicker from '../components/ui/MoodPicker';
import FloatingHearts from '../components/ui/FloatingHearts';
import { Calendar, Heart, Save, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Journal = () => {
  const [entry, setEntry] = useState('');
  const [mood, setMood] = useState('happy');
  const [showHearts, setShowHearts] = useState(false);
  const { toast } = useToast();
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Sample past entries
  const pastEntries = [
    {
      id: 1,
      date: "September 12, 2025",
      content: "Today was a special day. We tried that new coffee shop downtown and spent hours talking about our dreams. I love how you listen to every word I say.",
      author: "Emily",
      mood: "happy"
    },
    {
      id: 2,
      date: "September 10, 2025",
      content: "I had a tough day at work, but your supportive messages made everything better. Thank you for being my rock.",
      author: "Alex",
      mood: "neutral"
    }
  ];

  const saveEntry = () => {
    if (entry.trim().length === 0) return;
    
    // In a real app, we'd save the entry to a database
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
              disabled={entry.trim().length === 0}
            >
              <Save size={16} />
              Save Entry
            </button>
          </div>
        </JournalCard>
      </section>
      
      <h2 className="text-xl font-serif mb-4">Past Entries</h2>
      
      <section className="space-y-6">
        {pastEntries.map(entryData => (
          <JournalCard key={entryData.id} animated>
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-500">{entryData.date}</p>
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} /> <span>{entryData.author}</span>
                  {entryData.mood === 'happy' && <Heart size={14} className="text-journal-blush" />}
                </div>
              </div>
            </div>
            
            <p className="whitespace-pre-line">{entryData.content}</p>
          </JournalCard>
        ))}
      </section>
    </MainLayout>
  );
};

export default Journal;
