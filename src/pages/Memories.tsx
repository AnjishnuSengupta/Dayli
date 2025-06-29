
import React, { useState, useRef } from 'react';
import MainLayout from '../components/layout/MainLayout';
import JournalCard from '../components/ui/JournalCard';
import FloatingHearts from '../components/ui/FloatingHearts';
import MemoryGallery from '../components/ui/MemoryGallery';
import { Camera, Plus, Bookmark, Heart, Loader2, Trash2, Grid, List, Filter, Search, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Memory } from '@/services/memoriesService.universal';
// Use universal image service for MongoDB
import { uploadImage } from '@/services/imageService.universal';
import { saveMemory, getMemories, toggleFavorite, deleteMemory } from '@/services/memoriesService.universal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const Memories = () => {
  const [showHearts, setShowHearts] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry'>('grid');
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch memories
  const { data: memories, isLoading } = useQuery({
    queryKey: ['memories', currentUser?.id],
    queryFn: () => currentUser ? getMemories(currentUser.id) : Promise.resolve([]),
    enabled: !!currentUser?.id
  });

  // Filter memories based on search term and favorites filter
  const filteredMemories = React.useMemo(() => {
    if (!memories) return [];
    
    return memories.filter((memory: Memory) => {
      // Filter by favorites if enabled
      if (filterFavorites && !memory.isFavorite) {
        return false;
      }
      
      // Filter by search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          memory.title.toLowerCase().includes(term) ||
          memory.caption.toLowerCase().includes(term) ||
          memory.date.toLowerCase().includes(term)
        );
      }
      
      return true;
    });
  }, [memories, filterFavorites, searchTerm]);

  // Save memory mutation
  const saveMutation = useMutation({
    mutationFn: ({ memory, file }: { memory: Memory, file: File }) => {
      if (!currentUser) throw new Error("Authentication required");
      // Pass the userId to the secure saveMemory function
      return saveMemory(memory, file, currentUser.id);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      
      toast({
        title: "Memory saved",
        description: "Your special moment has been preserved securely",
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
    mutationFn: ({ id, isFavorite }: { id: string, isFavorite: boolean }) => {
      if (!currentUser) throw new Error("Authentication required");
      return toggleFavorite(id, isFavorite);
    },
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

  // Delete memory mutation
  const deleteMutation = useMutation({
    mutationFn: ({ id, imageUrl }: { id: string, imageUrl: string }) => {
      if (!currentUser) throw new Error("Authentication required");
      return deleteMemory(id, imageUrl, currentUser.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories'] });
      
      toast({
        title: "Memory deleted",
        description: "Your memory has been securely removed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting memory",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive"
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

  const saveMemoryHandler = async () => {
    if (!title.trim() || !date.trim() || !caption.trim() || !selectedImage || !currentUser) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and select an image",
        variant: "destructive"
      });
      return;
    }
    
    // Additional client-side validation
    if (selectedImage.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedImage.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file",
        variant: "destructive"
      });
      return;
    }
    
    // Show loading toast for large images
    if (selectedImage.size > 2 * 1024 * 1024) {
      toast({
        title: "Uploading image securely",
        description: "Large images may take a moment to upload and verify",
      });
    }
    
    const memory = {
      title,
      date,
      caption,
      createdBy: currentUser.id,
      imageUrl: '', // Will be set by the saveMemory function
      createdAt: new Date(), // Use regular Date object
      isFavorite: false, // Default to false for new memories
      // Additional security metadata
      timestamp: Date.now(),
    };
    
    saveMutation.mutate({ memory, file: selectedImage });
  };
  
  const handleDeleteMemory = (id: string, imageUrl: string) => {
    if (window.confirm("Are you sure you want to delete this memory? This action cannot be undone.")) {
      if (!currentUser) {
        toast({
          title: "Error",
          description: "You must be logged in to delete memories",
          variant: "destructive"
        });
        return;
      }
      
      deleteMutation.mutate({ id, imageUrl });
    }
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
        <h1 className="text-3xl md:text-4xl font-serif mb-2 animate-fade-in">
          Memory Board
        </h1>
        <p className="text-gray-600 animate-fade-in opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          Capture your special moments together
        </p>
      </section>
      
      <section className="mb-8 animate-fade-in opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
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
      
      <section className="animate-fade-in opacity-0" style={{ animationDelay: '600ms', animationFillMode: 'forwards' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-xl font-serif">Your Memories</h2>
          
          <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
            {/* Search input */}
            <div className="relative w-full md:w-auto">
              <input
                type="text"
                placeholder="Search memories..."
                className="input-field py-2 pl-3 pr-10 text-sm w-full md:w-auto"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm('')}
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* Favorites filter */}
            <button
              className={`px-3 py-2 rounded-xl text-sm flex items-center gap-1 transition-colors ${
                filterFavorites 
                  ? 'bg-journal-blush/20 text-pink-600' 
                  : 'bg-white/70 text-gray-600 hover:bg-white'
              }`}
              onClick={() => setFilterFavorites(!filterFavorites)}
            >
              <Heart size={16} fill={filterFavorites ? "#FFDEE2" : "transparent"} />
              Favorites
            </button>
            
            {/* View mode toggle */}
            <div className="flex bg-white/70 rounded-xl p-1">
              <button
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-journal-lavender/30' : 'hover:bg-gray-100'}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                <Grid size={16} />
              </button>
              <button
                className={`p-2 rounded-lg transition-colors ${viewMode === 'masonry' ? 'bg-journal-lavender/30' : 'hover:bg-gray-100'}`}
                onClick={() => setViewMode('masonry')}
                title="Masonry view"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-journal-lavender" />
          </div>
        ) : (
          <>
            {filteredMemories && filteredMemories.length > 0 ? (
              <MemoryGallery
                memories={filteredMemories}
                viewMode={viewMode}
                onFavorite={bookmarkMemory}
                onDelete={handleDeleteMemory}
              />
            ) : (
              <div>
                <JournalCard>
                  <p className="text-center py-8">
                    {memories && memories.length > 0 
                      ? 'No memories match your search or filter criteria.' 
                      : 'No memories yet. Add your first special moment!'}
                  </p>
                </JournalCard>
              </div>
            )}
          </>
        )}
      </section>
      
      {/* Create Memory Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="glass border-journal-lavender/30 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Create New Memory</DialogTitle>
            <p className="text-sm text-muted-foreground" id="memory-form-description">
              Add details and a photo of a special moment you want to remember.
            </p>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="animate-fade-in">
              <label className="block text-sm font-medium mb-1">Memory Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field w-full focus:ring-pink-400 transition-all"
                placeholder="Our first hike together"
              />
            </div>
            
            <div className="animate-fade-in opacity-0" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input-field w-full focus:ring-pink-400 transition-all"
                placeholder="September 15, 2025"
              />
            </div>
            
            <div className="animate-fade-in opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <label className="block text-sm font-medium mb-1">Caption</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="input-field w-full focus:ring-pink-400 transition-all"
                placeholder="That beautiful sunset we saw..."
              />
            </div>
            
            <div className="animate-fade-in opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
              <label className="block text-sm font-medium mb-1">Photo</label>
              {previewUrl ? (
                <div className="relative rounded-md overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-md mb-2" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white transition-all"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-md p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/30 transition-all"
                >
                  <Camera size={32} className="mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to select an image</p>
                  <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, GIF</p>
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
            
            <div className="flex justify-end gap-2 pt-4 animate-fade-in opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
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
                {saveMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    Saving...
                  </span>
                ) : 'Save Memory'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Memories;
