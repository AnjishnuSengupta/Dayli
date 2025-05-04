
import React, { ReactNode } from 'react';
import Navigation from './Navigation';
import { Heart } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface MainLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const MainLayout = ({ children, showNav = true }: MainLayoutProps) => {
  const { toast } = useToast();

  // This function will be available globally for success messages
  const showHeartToast = (message: string) => {
    toast({
      title: message,
      description: <Heart className="text-journal-blush animate-pulse-gentle" />,
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="fixed w-full h-full -z-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-journal-lavender/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-journal-peach/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/3 w-40 h-40 bg-journal-skyblue/20 rounded-full blur-3xl"></div>
        <div className="absolute animate-stars w-full h-full opacity-50"></div>
      </div>
      
      {showNav && <Navigation />}
      
      <main className="flex-grow p-4 md:p-6 pt-24 container mx-auto">
        {children}
      </main>
      
      <footer className="p-4 text-center text-sm text-gray-500">
        <p className="font-serif italic">Our Journal - Where hearts connect 💕</p>
      </footer>
    </div>
  );
};

export default MainLayout;
