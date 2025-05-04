
import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import JournalCard from '../components/ui/JournalCard';
import FloatingHearts from '../components/ui/FloatingHearts';
import { Calendar, Trophy, Plus, Heart, Award, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { addMilestone, getMilestones, generateAutomaticMilestones } from '@/services/milestonesService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Milestones = () => {
  const [showHearts, setShowHearts] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newMilestoneOpen, setNewMilestoneOpen] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Sample relationship start date - in a real app, this would come from user settings
  const relationshipStartDate = new Date(2025, 7, 29); // August 29, 2025
  const today = new Date();
  const daysSince = Math.floor((today.getTime() - relationshipStartDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Fetch milestones
  const { data: milestones, isLoading } = useQuery({
    queryKey: ['milestones'],
    queryFn: getMilestones,
    enabled: !!currentUser
  });
  
  // Add milestone mutation
  const addMilestoneMutation = useMutation({
    mutationFn: addMilestone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      
      setNewMilestoneTitle('');
      setNewMilestoneDate('');
      setNewMilestoneOpen(false);
      
      // Show celebration animations
      setShowHearts(true);
      setShowConfetti(true);
      
      toast({
        title: "New milestone created",
        description: "A special moment has been added to your journey",
      });
      
      setTimeout(() => {
        setShowHearts(false);
        setShowConfetti(false);
      }, 3000);
    }
  });
  
  // Generate automatic milestones
  const generateMilestonesMutation = useMutation({
    mutationFn: () => generateAutomaticMilestones(relationshipStartDate, currentUser?.uid || ''),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    }
  });

  // Generate initial automatic milestones when the component mounts
  useEffect(() => {
    if (currentUser) {
      generateMilestonesMutation.mutate();
    }
  }, [currentUser]);

  const addCustomMilestone = () => {
    if (!newMilestoneTitle.trim() || !newMilestoneDate.trim() || !currentUser) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and date fields",
      });
      return;
    }
    
    const newMilestone = {
      title: newMilestoneTitle,
      date: newMilestoneDate,
      achieved: true,
      description: '',
      createdBy: currentUser.uid,
      isAutomatic: false
    };
    
    addMilestoneMutation.mutate(newMilestone);
  };

  const celebrateMilestone = (id: string) => {
    setShowHearts(true);
    setShowConfetti(true);
    
    toast({
      title: "Milestone celebrated",
      description: "These special moments are worth remembering",
    });
    
    setTimeout(() => {
      setShowHearts(false);
      setShowConfetti(false);
    }, 3000);
  };

  // Group milestones into automatic and custom
  const autoMilestones = milestones?.filter(m => m.isAutomatic) || [];
  const customMilestones = milestones?.filter(m => !m.isAutomatic) || [];

  return (
    <MainLayout>
      {showHearts && <FloatingHearts count={10} />}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 confetti-container">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10px`,
                  backgroundColor: [`#FFDEE2`, `#E5DEFF`, `#D3E4FD`, `#FDE1D3`][Math.floor(Math.random() * 4)],
                  transform: `rotate(${Math.random() * 360}deg)`,
                  width: `${Math.random() * 8 + 5}px`,
                  height: `${Math.random() * 4 + 6}px`,
                  animation: `fall ${Math.random() * 3 + 2}s linear forwards`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fix: Removed the invalid style jsx element and use the CSS that already exists in index.css */}
      
      <section className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-serif mb-2">
          Our Milestones
        </h1>
        <p className="text-gray-600">
          Celebrating {daysSince} days together 💕
        </p>
      </section>
      
      {/* Add New Milestone Button */}
      <section className="mb-8">
        <button
          onClick={() => setNewMilestoneOpen(true)}
          className="journal-card bg-white/60 w-full flex items-center justify-center gap-2 py-5 hover:bg-white/70 transition-all"
        >
          <Plus size={18} className="text-journal-blush" />
          <span className="font-serif">Add a Special Moment</span>
        </button>
      </section>
      
      {/* Automatic Milestones Section */}
      <section className="mb-8">
        <h2 className="text-xl font-serif mb-4 flex items-center gap-2">
          <Trophy className="text-journal-lavender" size={20} /> 
          Relationship Milestones
        </h2>
        
        {isLoading ? (
          <JournalCard>
            <p className="text-center py-4">Loading milestones...</p>
          </JournalCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {autoMilestones.map(milestone => (
              <JournalCard 
                key={milestone.id} 
                className={`${milestone.achieved ? 'glass' : 'bg-white/40 border border-dashed border-gray-200'} transition-all relative overflow-hidden`}
                animated
              >
                {milestone.achieved && (
                  <div className="absolute -right-4 -top-4 bg-journal-peach p-6 rounded-full border-4 border-white/50 flex items-center justify-center rotate-12">
                    <Award className="text-white" />
                  </div>
                )}
                <h3 className="font-serif text-lg mb-1">{milestone.title}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                  <Calendar size={14} /> 
                  {milestone.date}
                </p>
                <p className="text-sm mb-3">{milestone.description}</p>
                
                {milestone.achieved ? (
                  <button
                    onClick={() => celebrateMilestone(milestone.id || '')}
                    className="flex items-center gap-1 text-sm text-journal-blush hover:text-journal-lavender"
                  >
                    <Heart size={16} fill="#FFDEE2" /> Celebrate this moment
                  </button>
                ) : (
                  <p className="text-sm text-gray-400 italic">Coming soon...</p>
                )}
              </JournalCard>
            ))}
          </div>
        )}
      </section>
      
      {/* Custom Milestones Section */}
      <section className="mb-8">
        <h2 className="text-xl font-serif mb-4 flex items-center gap-2">
          <Heart className="text-journal-blush" size={20} /> 
          Special Moments
        </h2>
        
        {isLoading ? (
          <JournalCard>
            <p className="text-center py-4">Loading special moments...</p>
          </JournalCard>
        ) : customMilestones.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customMilestones.map(milestone => (
              <JournalCard 
                key={milestone.id} 
                className="glass relative overflow-hidden"
                animated
              >
                <div className="absolute -right-4 -top-4 bg-journal-blush p-6 rounded-full border-4 border-white/50 flex items-center justify-center rotate-12">
                  <Heart className="text-white" />
                </div>
                <h3 className="font-serif text-lg mb-1">{milestone.title}</h3>
                <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                  <Calendar size={14} /> 
                  {milestone.date}
                </p>
                {milestone.description && (
                  <p className="text-sm mb-3">{milestone.description}</p>
                )}
                
                <button
                  onClick={() => celebrateMilestone(milestone.id || '')}
                  className="flex items-center gap-1 text-sm text-journal-blush hover:text-journal-lavender"
                >
                  <Heart size={16} fill="#FFDEE2" /> Celebrate this moment
                </button>
              </JournalCard>
            ))}
          </div>
        ) : (
          <JournalCard>
            <p className="text-center py-4">No special moments added yet. Create your first one!</p>
          </JournalCard>
        )}
      </section>
      
      {/* New Milestone Dialog */}
      <Dialog open={newMilestoneOpen} onOpenChange={setNewMilestoneOpen}>
        <DialogContent className="glass border-journal-lavender/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Add a Special Moment</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label htmlFor="milestone-title" className="block text-sm font-medium mb-1">
                Milestone Title
              </label>
              <input
                id="milestone-title"
                className="input-field w-full p-2"
                placeholder="First 'I love you', First trip together..."
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="milestone-date" className="block text-sm font-medium mb-1">
                Date
              </label>
              <input
                id="milestone-date"
                className="input-field w-full p-2"
                placeholder="September 15, 2025"
                value={newMilestoneDate}
                onChange={(e) => setNewMilestoneDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <DialogClose className="btn-secondary">
              Cancel
            </DialogClose>
            <button onClick={addCustomMilestone} className="btn-primary flex items-center gap-1">
              <Save size={16} />
              Save Milestone
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Milestones;
