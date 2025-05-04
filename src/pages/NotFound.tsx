
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Home } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

const NotFound = () => {
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
        
        <Link 
          to="/dashboard" 
          className="btn-primary inline-flex items-center gap-2"
        >
          <Home size={18} />
          Return Home
        </Link>
      </div>
    </MainLayout>
  );
};

export default NotFound;
