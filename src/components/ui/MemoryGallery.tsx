import React, { useState } from 'react';
import { Memory } from '@/services/memoriesService';
import { Bookmark, Heart, Trash2, Maximize } from 'lucide-react';
import ImageLightbox from './ImageLightbox';
import JournalCard from './JournalCard';

interface MemoryGalleryProps {
  memories: Memory[];
  onFavorite: (id: string, isFavorite: boolean) => void;
  onDelete: (id: string, imageUrl: string) => void;
  viewMode?: 'grid' | 'masonry';
}

const MemoryGallery: React.FC<MemoryGalleryProps> = ({
  memories,
  onFavorite,
  onDelete,
  viewMode = 'grid'
}) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageUrls = memories.map(memory => memory.imageUrl);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  if (viewMode === 'masonry') {
    // Divide memories into 3 columns for masonry layout
    const column1 = memories.filter((_, i) => i % 3 === 0);
    const column2 = memories.filter((_, i) => i % 3 === 1);
    const column3 = memories.filter((_, i) => i % 3 === 2);

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1 */}
          <div className="flex flex-col gap-4 stagger-animate">
            {column1.map((memory, index) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                index={memories.findIndex(m => m.id === memory.id)}
                onFavorite={onFavorite}
                onDelete={onDelete}
                openLightbox={openLightbox}
              />
            ))}
          </div>
          
          {/* Column 2 */}
          <div className="flex flex-col gap-4 stagger-animate" style={{ animationDelay: '100ms' }}>
            {column2.map((memory, index) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                index={memories.findIndex(m => m.id === memory.id)}
                onFavorite={onFavorite}
                onDelete={onDelete}
                openLightbox={openLightbox}
              />
            ))}
          </div>
          
          {/* Column 3 */}
          <div className="flex flex-col gap-4 stagger-animate" style={{ animationDelay: '200ms' }}>
            {column3.map((memory, index) => (
              <MemoryCard
                key={memory.id}
                memory={memory}
                index={memories.findIndex(m => m.id === memory.id)}
                onFavorite={onFavorite}
                onDelete={onDelete}
                openLightbox={openLightbox}
              />
            ))}
          </div>
        </div>
        
        <ImageLightbox
          images={imageUrls}
          currentIndex={currentImageIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </>
    );
  }

  // Default grid view
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-animate">
        {memories.map((memory, index) => (
          <MemoryCard
            key={memory.id}
            memory={memory}
            index={index}
            onFavorite={onFavorite}
            onDelete={onDelete}
            openLightbox={openLightbox}
          />
        ))}
      </div>
      
      <ImageLightbox
        images={imageUrls}
        currentIndex={currentImageIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
};

interface MemoryCardProps {
  memory: Memory;
  index: number;
  onFavorite: (id: string, isFavorite: boolean) => void;
  onDelete: (id: string, imageUrl: string) => void;
  openLightbox: (index: number) => void;
}

const MemoryCard: React.FC<MemoryCardProps> = ({
  memory,
  index,
  onFavorite,
  onDelete,
  openLightbox
}) => {
  return (
    <JournalCard key={memory.id} className="p-4 overflow-hidden group" animated animationType="float" hover="lift">
      <div className="relative rounded-lg overflow-hidden mb-4">
        <img 
          src={memory.imageUrl} 
          alt={memory.title} 
          className="w-full aspect-video object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy" // Add lazy loading for better performance
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 right-3 flex gap-2">
          <button 
            className="p-2 bg-white/80 rounded-full hover:bg-white transition-all"
            onClick={() => onFavorite(memory.id!, !!memory.isFavorite)}
          >
            <Bookmark 
              size={16} 
              fill={memory.isFavorite ? "#FFDEE2" : "transparent"}
            />
          </button>
          
          <button 
            className="p-2 bg-white/80 rounded-full hover:bg-white transition-all"
            onClick={() => openLightbox(index)}
          >
            <Maximize size={16} />
          </button>
        </div>
      </div>
      
      <h3 className="font-medium text-lg mb-1">{memory.title}</h3>
      <p className="text-sm text-gray-500 mb-2">{memory.date}</p>
      <p className="text-sm italic">{memory.caption}</p>
      
      <div className="mt-4 flex justify-between">
        <button 
          className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 transition-colors"
          onClick={() => onDelete(memory.id!, memory.imageUrl)}
        >
          <Trash2 size={16} /> Delete
        </button>
        <button 
          className="flex items-center gap-1 text-sm text-journal-blush hover:text-pink-600 transition-colors"
          onClick={() => onFavorite(memory.id!, !!memory.isFavorite)}
        >
          <Heart size={16} fill={memory.isFavorite ? "#FFDEE2" : "transparent"} /> 
          {memory.isFavorite ? "Unfavorite" : "Favorite"}
        </button>
      </div>
    </JournalCard>
  );
};

export default MemoryGallery;
