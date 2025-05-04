
import React, { useState, useRef } from 'react';
import MainLayout from '../components/layout/MainLayout';
import JournalCard from '../components/ui/JournalCard';
import FloatingHearts from '../components/ui/FloatingHearts';
import { Camera, Plus, Bookmark, Heart, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { saveMemory, getMemories, toggleFavorite } from '@/services/memoriesService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const Memories = () => {
  const [showHearts, setShowHearts] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch memories
  const { data: memories, isLoading } = useQuery({
    queryKey: ['memories'],
    queryFn: getMemories
  });

  // Save memory mutation
  const saveMutation = useMutation({
    mutationFn: ({ memory, file }: { memory: any, file: File }) => 
      saveMemory(memory, file),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      
      toast({
        title: "Memory saved",
        description: "Your special moment has been preserved",
      });
      
      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error saving memory",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
      });
    }
  });

  // Toggle favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string, isFavorite: boolean }) => 
      toggleFavorite(id, isFavorite),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      
      setShowHearts(true);
      setTimeout(() => setShowHearts(false), 2000);
      
      toast({
        title: "Memory updated",
        description: "Added to your favorites",
      });
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveMemoryHandler = () => {
    if (!title.trim() || !date.trim() || !caption.trim() || !selectedImage || !currentUser) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select an image",
        variant: "destructive"
      });
      return;
    }
    
    const memory = {
      title,
      date,
      caption,
      createdBy: currentUser.uid,
    };
    
    saveMutation.mutate({ memory, file: selectedImage });
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setCaption('');
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  const bookmarkMemory = (id: string, currentValue: boolean) => {
    favoriteMutation.mutate({ id, isFavorite: !currentValue });
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
            onClick={() => setIsDialogOpen(true)}
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
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-journal-lavender" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {memories && memories.length > 0 ? memories.map((memory: any) => (
              <JournalCard key={memory.id} className="p-4" animated>
                <div className="relative rounded-lg overflow-hidden mb-4">
                  <img 
                    src={memory.imageUrl} 
                    alt={memory.title} 
                    className="w-full aspect-video object-cover"
                  />
                  <button 
                    className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white transition-all"
                    onClick={() => bookmarkMemory(memory.id, !!memory.isFavorite)}
                  >
                    <Bookmark 
                      size={16} 
                      fill={memory.isFavorite ? "#FFDEE2" : "transparent"}
                    />
                  </button>
                </div>
                
                <h3 className="font-medium text-lg mb-1">{memory.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{memory.date}</p>
                <p className="text-sm italic">{memory.caption}</p>
                
                <div className="mt-4 flex justify-end">
                  <button 
                    className="flex items-center gap-1 text-sm text-journal-blush"
                    onClick={() => bookmarkMemory(memory.id, !!memory.isFavorite)}
                  >
                    <Heart size={16} fill={memory.isFavorite ? "#FFDEE2" : "transparent"} /> 
                    {memory.isFavorite ? "Unfavorite" : "Favorite"}
                  </button>
                </div>
              </JournalCard>
            )) : (
              <div className="col-span-2">
                <JournalCard>
                  <p className="text-center py-8">No memories yet. Add your first special moment!</p>
                </JournalCard>
              </div>
            )}
          </div>
        )}
      </section>
      
      {/* Create Memory Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass border-journal-lavender/30 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Create New Memory</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Memory Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field w-full"
                placeholder="Our first hike together"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field w-full"
                placeholder="September 15, 2025"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Caption</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="input-field w-full"
                placeholder="That beautiful sunset we saw..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Photo</label>
              {previewUrl ? (
                <div className="relative">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-md mb-2" 
                  />
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 bg-white/80 p-1 rounded-full"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-md p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/30"
                >
                  <Camera size={32} className="mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to select an image</p>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setIsDialogOpen(false);
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveMemoryHandler}
                className="btn-primary"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? 'Saving...' : 'Save Memory'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Memories;
