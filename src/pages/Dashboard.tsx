
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, BookOpen, Image, Calendar, Plus, Loader2 } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import JournalCard from '../components/ui/JournalCard';
import MoodPicker from '../components/ui/MoodPicker';
import FloatingHearts from '../components/ui/FloatingHearts';
import ZoomStagger from '../components/ui/ZoomStagger';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { motion } from 'framer-motion';
import { JournalEntry, getJournalEntries } from '@/services/journalService';
import { Memory, getMemories } from '@/services/memoriesService';
import { useToast } from '@/components/ui/use-toast';

// Extend the JournalEntry interface to include excerpt
interface EnhancedJournalEntry extends JournalEntry {
  excerpt?: string;
}

const Dashboard = () => {
  const [mood, setMood] = useState('happy');
  const [showHearts, setShowHearts] = useState(false);
  const [relationshipDays, setRelationshipDays] = useState<number | null>(null);
  const [recentEntries, setRecentEntries] = useState<EnhancedJournalEntry[]>([]);
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [isLoadingMemories, setIsLoadingMemories] = useState(true);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Fetch relationship start date and calculate days together
  useEffect(() => {
    const fetchRelationshipStartDate = async () => {
      if (currentUser?.uid) {
        try {
          const userSettingsRef = doc(db, "user_settings", currentUser.uid);
          const docSnap = await getDoc(userSettingsRef);
          
          if (docSnap.exists() && docSnap.data().relationshipStartDate) {
            const startDateStr = docSnap.data().relationshipStartDate;
            const startDate = new Date(startDateStr);
            
            // Only calculate if we have a valid date
            if (!isNaN(startDate.getTime())) {
              const today = new Date();
              const diffTime = Math.abs(today.getTime() - startDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              setRelationshipDays(diffDays);
            }
          }
        } catch (error) {
          console.error("Error fetching relationship start date:", error);
        }
      }
    };

    fetchRelationshipStartDate();
  }, [currentUser]);
  
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
  }, [currentUser]);
  
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
  }, [currentUser]);
  
  const handleHeartsClick = () => {
    setShowHearts(true);
    setTimeout(() => setShowHearts(false), 2000);
    
    toast({
      title: "Love sent!",
      description: "Your partner will feel the love.",
    });
  };
  
  return (
    <MainLayout>
      {showHearts && <FloatingHearts count={5} />}
      
      <motion.section 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl md:text-4xl font-serif text-center mb-2">
          {currentDate}
        </h1>
        <motion.p 
          className="text-center text-gray-600 italic font-serif"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {relationshipDays !== null 
            ? `You've been together for ${relationshipDays} days 💕` 
            : 'Set your relationship date in settings 💕'}
        </motion.p>
      </motion.section>
      
      <motion.section 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-xl font-serif mb-2">How are you feeling today?</h2>
        <MoodPicker selectedMood={mood} setSelectedMood={setMood} />
      </motion.section>
      
      <motion.section 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif">Recent Journal Entries</h2>
          <Link to="/journal" className="text-sm flex items-center gap-1 text-gray-600 hover:text-gray-900">
            See all <BookOpen size={16} />
          </Link>
        </div>
        
        <div className="grid gap-4">
          {isLoadingEntries ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-journal-lavender" />
            </div>
          ) : recentEntries.length > 0 ? (
            <ZoomStagger>
              {recentEntries.map((entry) => (
                <motion.div 
                  key={entry.id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <JournalCard className="cursor-pointer" animated>
                    <h3 className="font-medium mb-1">{entry.authorName || 'Journal Entry'}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {entry.createdAt instanceof Date 
                        ? entry.createdAt.toLocaleDateString() 
                        : new Date(entry.createdAt.seconds * 1000).toLocaleDateString()}
                    </p>
                    <p className="text-sm">{entry.excerpt || entry.content.substring(0, 80) + '...'}</p>
                  </JournalCard>
                </motion.div>
              ))}
              <Link to="/journal">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0px 5px 15px rgba(0,0,0,0.1)" }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <div className="journal-card bg-gray-50/80 border-dashed border-2 border-gray-200 flex items-center justify-center py-10 hover:bg-white/80 transition-all rounded-xl">
                    <span className="flex items-center gap-2 text-gray-500">
                      <Plus size={18} />
                      Write a new entry
                    </span>
                  </div>
                </motion.div>
              </Link>
            </ZoomStagger>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <JournalCard>
                <div className="text-center py-8 space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{ width: "fit-content", margin: "0 auto" }}
                  >
                    <BookOpen size={32} className="text-journal-blush/50" />
                  </motion.div>
                  <h3 className="font-medium">No Journal Entries Yet</h3>
                  <p className="text-gray-500 text-sm">Start capturing your thoughts and special moments together.</p>
                  <Link to="/journal">
                    <motion.button
                      className="btn-primary mt-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create Your First Entry
                    </motion.button>
                  </Link>
                </div>
              </JournalCard>
            </motion.div>
          )}
        </div>
      </motion.section>
      
      <motion.section 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif">Memory Board</h2>
          <Link to="/memories" className="text-sm flex items-center gap-1 text-gray-600 hover:text-gray-900">
            See all <Image size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {isLoadingMemories ? (
            <div className="col-span-2 flex justify-center py-8">
              <Loader2 className="animate-spin text-journal-lavender" />
            </div>
          ) : recentMemories.length > 0 ? (
            <ZoomStagger baseDelay={200} incrementDelay={100}>
              {recentMemories.map((memory) => (
                <motion.div
                  key={memory.id}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <JournalCard className="cursor-pointer p-3" animated>
                    <div className="aspect-square rounded-lg overflow-hidden mb-2">
                      <img 
                        src={memory.imageUrl} 
                        alt={memory.title} 
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <h3 className="font-medium text-sm mb-1">{memory.title}</h3>
                    <p className="text-xs text-gray-500">{memory.date}</p>
                  </JournalCard>
                </motion.div>
              ))}
            </ZoomStagger>
          ) : (
            <motion.div 
              className="col-span-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <JournalCard>
                <div className="text-center py-8 space-y-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{ width: "fit-content", margin: "0 auto" }}
                  >
                    <Image size={32} className="text-journal-lavender/50" />
                  </motion.div>
                  <h3 className="font-medium">No Memories Yet</h3>
                  <p className="text-gray-500 text-sm">Start capturing your special moments together.</p>
                  <Link to="/memories">
                    <motion.button
                      className="btn-primary mt-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create Your First Memory
                    </motion.button>
                  </Link>
                </div>
              </JournalCard>
            </motion.div>
          )}
        </div>
      </motion.section>
      
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <JournalCard className="text-center">
          <motion.button 
            className="inline-flex items-center gap-2 font-serif text-lg"
            onClick={handleHeartsClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Send love to your partner <Heart className="text-journal-blush" fill="#FFDEE2" />
          </motion.button>
        </JournalCard>
      </motion.section>
    </MainLayout>
  );
};

export default Dashboard;
