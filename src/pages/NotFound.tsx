
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Home, Search, ArrowLeft } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';

const NotFound = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term');
      return;
    }
    
    // In a real app, you might want to navigate to a search results page
    // For now, we'll just show a toast and navigate to dashboard
    toast.info(`Searching for: ${searchQuery}`);
    navigate('/dashboard');
  };

  const goBack = () => {
    navigate(-1);
  };

  return (
    <MainLayout showNav={false}>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <Heart 
          size={60} 
          className="text-journal-blush mb-8 animate-float" 
          strokeWidth={1.5}
        />
        
        <h1 className="text-4xl md:text-5xl font-serif font-medium mb-4">
          Page Not Found
        </h1>
        
        <p className="text-lg md:text-xl text-gray-700 max-w-lg mx-auto mb-8">
          Oops! We can't find the page you're looking for.
        </p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Button 
            onClick={goBack}
            variant="outline"
            className="inline-flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Go Back
          </Button>
          
          <Link to="/dashboard">
            <Button 
              className="inline-flex items-center gap-2 bg-gradient-to-r from-journal-blush to-journal-lavender hover:opacity-90"
            >
              <Home size={18} />
              Return Home
            </Button>
          </Link>
        </div>
        
        <div className="w-full max-w-md mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for something..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pr-10 input-field"
            />
            <Search 
              size={18} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 cursor-pointer"
              onClick={handleSearch}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          <Link to="/journal" className="p-4 glass rounded-lg hover:shadow-md transition-all">
            <h3 className="font-medium mb-1">Journal</h3>
            <p className="text-sm text-gray-600">Write your thoughts</p>
          </Link>
          <Link to="/memories" className="p-4 glass rounded-lg hover:shadow-md transition-all">
            <h3 className="font-medium mb-1">Memories</h3>
            <p className="text-sm text-gray-600">Cherish moments</p>
          </Link>
          <Link to="/milestones" className="p-4 glass rounded-lg hover:shadow-md transition-all">
            <h3 className="font-medium mb-1">Milestones</h3>
            <p className="text-sm text-gray-600">Track progress</p>
          </Link>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotFound;
