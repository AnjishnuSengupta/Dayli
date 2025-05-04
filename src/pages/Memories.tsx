
import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import JournalCard from '../components/ui/JournalCard';
import FloatingHearts from '../components/ui/FloatingHearts';
import { Camera, Plus, Bookmark, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Memories = () => {
  const [showHearts, setShowHearts] = useState(false);
  const { toast } = useToast();
  
  // Sample memories
  const memories = [
    {
      id: 1,
      title: "Our picnic at Sunset Park",
      date: "September 15, 2025",
      caption: "First time we tried that homemade lemonade! ✨",
      imageUrl: "https://images.unsplash.com/photo-1526392155195-68a7bef57bc5?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 2,
      title: "Evening walk by the beach",
      date: "September 10, 2025",
      caption: "Your smile was brighter than the sunset 🌅",
      imageUrl: "https://images.unsplash.com/photo-1468818438311-4bab781ab9b8?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 3,
      title: "Coffee shop date",
      date: "September 5, 2025",
      caption: "That conversation about our future ☕",
      imageUrl: "https://images.unsplash.com/photo-1507226983735-a838615193b0?w=500&auto=format&fit=crop&q=60"
    },
    {
      id: 4,
      title: "Movie night at home",
      date: "September 1, 2025",
      caption: "Laughing so hard at that comedy 🍿",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60"
    }
  ];

  const saveMemory = () => {
    // In a real app, we'd handle file upload and metadata
    toast({
      title: "Creating new memory",
      description: "You'd be able to upload an image here",
    });
  };

  const bookmarkMemory = (id: number) => {
    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 2000);
    
    toast({
      title: "Memory bookmarked",
      description: "Added to your favorites",
    });
  };

  return (
    <MainLayout>
      {showHearts && <FloatingHearts count={3} />}
      
      <section className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-serif mb-2">
          Memory Board
        </h1>
        <p className="text-gray-600">
          Capture your special moments together
        </p>
      </section>
      
      <section className="mb-8">
        <JournalCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif">Add New Memory</h2>
          </div>
          
          <button
            onClick={saveMemory}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:bg-white/50 transition-all"
          >
            <Camera size={32} className="mb-2" />
            <p>Upload a photo memory</p>
            <span className="text-sm mt-2 flex items-center gap-1">
              <Plus size={14} /> Add a special moment
            </span>
          </button>
        </JournalCard>
      </section>
      
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif">Your Memories</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {memories.map(memory => (
            <JournalCard key={memory.id} className="p-4" animated>
              <div className="relative rounded-lg overflow-hidden mb-4">
                <img 
                  src={memory.imageUrl} 
                  alt={memory.title} 
                  className="w-full aspect-video object-cover"
                />
                <button 
                  className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-all"
                  onClick={() => bookmarkMemory(memory.id)}
                >
                  <Bookmark size={16} />
                </button>
              </div>
              
              <h3 className="font-medium text-lg mb-1">{memory.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{memory.date}</p>
              <p className="text-sm italic">{memory.caption}</p>
              
              <div className="mt-4 flex justify-end">
                <button 
                  className="flex items-center gap-1 text-sm text-journal-blush"
                  onClick={() => bookmarkMemory(memory.id)}
                >
                  <Heart size={16} fill="#FFDEE2" /> Favorite
                </button>
              </div>
            </JournalCard>
          ))}
        </div>
      </section>
    </MainLayout>
  );
};

export default Memories;
