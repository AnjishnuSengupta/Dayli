
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

const Welcome = () => {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <MainLayout showNav={false}>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
        <div className={`transition-all duration-1000 ${loaded ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
          <div className="mb-8 relative">
            <Heart 
              size={60} 
              className="text-journal-blush animate-float" 
              fill="#FFDEE2"
            />
            <div className="absolute -top-4 -right-4 w-40 h-40 bg-journal-skyblue/20 rounded-full blur-3xl -z-10"></div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-serif font-medium mb-4">
            Our Journal
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 max-w-lg mx-auto mb-8">
            A special place for the two of you to capture moments, share feelings, and build your love story.
          </p>
          
          <div className="space-y-4">
            <Link 
              to="/login" 
              className="btn-primary inline-flex items-center gap-2"
            >
              Begin Your Journey <ArrowRight size={18} />
            </Link>
            
            <div className="text-sm text-gray-500 pt-6">
              <p>Already have an account? <Link to="/login" className="underline text-journal-lavender">Sign In</Link></p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Welcome;
