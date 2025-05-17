
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, BookOpen, Image, Calendar, Plus } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import JournalCard from '../components/ui/JournalCard';
import MoodPicker from '../components/ui/MoodPicker';
import FloatingHearts from '../components/ui/FloatingHearts';
import ZoomStagger from '../components/ui/ZoomStagger';

const Dashboard = () => {
  const [mood, setMood] = useState('happy');
  const [showHearts, setShowHearts] = useState(false);
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Sample data for the dashboard
  const recentEntries = [
    { id: 1, title: "Morning coffee thoughts", date: "Today", excerpt: "Woke up thinking about our future home..." },
    { id: 2, title: "That movie we watched", date: "Yesterday", excerpt: "I can't stop thinking about the ending..." }
  ];
  
  const recentMemories = [
    { id: 1, title: "Our picnic", date: "3 days ago", imageUrl: "https://images.unsplash.com/photo-1526392155195-68a7bef57bc5?w=500&auto=format&fit=crop&q=60" },
    { id: 2, title: "Sunset walk", date: "Last week", imageUrl: "https://images.unsplash.com/photo-1468818438311-4bab781ab9b8?w=500&auto=format&fit=crop&q=60" }
  ];

  const handleHeartsClick = () => {
    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 2000);
  };
  
  return (
    <MainLayout>
      {showHearts && <FloatingHearts count={5} />}
      
      <section className="mb-8">
        <h1 className="text-3xl md:text-4xl font-serif text-center mb-2">
          {currentDate}
        </h1>
        <p className="text-center text-gray-600 italic font-serif">
          You've been together for 37 days 💕
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-serif mb-2">How are you feeling today?</h2>
        <MoodPicker selectedMood={mood} setSelectedMood={setMood} />
      </section>
      
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif">Recent Journal Entries</h2>
          <Link to="/journal" className="text-sm flex items-center gap-1 text-gray-600 hover:text-gray-900">
            See all <BookOpen size={16} />
          </Link>
        </div>
        
        <div className="grid gap-4">
          <ZoomStagger>
            {recentEntries.map((entry) => (
              <JournalCard key={entry.id} className="cursor-pointer" animated>
                <h3 className="font-medium mb-1">{entry.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{entry.date}</p>
                <p className="text-sm">{entry.excerpt}</p>
              </JournalCard>
            ))}
            <Link to="/journal">
              <div className="journal-card bg-gray-50/80 border-dashed border-2 border-gray-200 flex items-center justify-center py-10 hover:bg-white/80 transition-all">
                <span className="flex items-center gap-2 text-gray-500">
                  <Plus size={18} />
                  Write a new entry
                </span>
              </div>
            </Link>
          </ZoomStagger>
        </div>
      </section>
      
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif">Memory Board</h2>
          <Link to="/memories" className="text-sm flex items-center gap-1 text-gray-600 hover:text-gray-900">
            See all <Image size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <ZoomStagger baseDelay={200} incrementDelay={100}>
            {recentMemories.map((memory) => (
              <JournalCard key={memory.id} className="cursor-pointer p-3" animated>
                <div className="aspect-square rounded-lg overflow-hidden mb-2">
                  <img 
                    src={memory.imageUrl} 
                    alt={memory.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-sm mb-1">{memory.title}</h3>
                <p className="text-xs text-gray-500">{memory.date}</p>
              </JournalCard>
            ))}
          </ZoomStagger>
        </div>
      </section>
      
      <section>
        <JournalCard className="text-center">
          <button 
            className="inline-flex items-center gap-2 font-serif text-lg"
            onClick={handleHeartsClick}
          >
            Send love to your partner <Heart className="text-journal-blush" fill="#FFDEE2" />
          </button>
        </JournalCard>
      </section>
    </MainLayout>
  );
};

export default Dashboard;
