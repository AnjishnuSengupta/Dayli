
import React, { ReactNode, useEffect, useState } from 'react';
import Navigation from './Navigation';
import { Heart } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const MainLayout = ({ children, showNav = true }: MainLayoutProps) => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [darkMode, setDarkMode] = useState(false);

  // Load user's dark mode preference
  useEffect(() => {
    const fetchDarkModePreference = async () => {
      if (currentUser?.uid) {
        try {
          const userSettingsRef = doc(db, "user_settings", currentUser.uid);
          const docSnap = await getDoc(userSettingsRef);
          
          if (docSnap.exists() && docSnap.data().darkMode) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
          } else {
            setDarkMode(false);
            document.documentElement.classList.remove('dark');
          }
        } catch (error) {
          console.error("Error fetching dark mode preference:", error);
        }
      }
    };

    fetchDarkModePreference();
  }, [currentUser]);

  // This function will be available globally for success messages
  const showHeartToast = (message: string) => {
    toast({
      title: message,
      description: <Heart className="text-journal-blush animate-pulse-gentle" />,
      duration: 3000,
    });
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark bg-gray-900 text-white' : ''}`}>
      <div className="fixed w-full h-full -z-10">
        <div className={`absolute top-20 left-20 w-64 h-64 ${darkMode ? 'bg-indigo-900/30' : 'bg-journal-lavender/20'} rounded-full blur-3xl`}></div>
        <div className={`absolute bottom-20 right-20 w-80 h-80 ${darkMode ? 'bg-pink-900/30' : 'bg-journal-peach/20'} rounded-full blur-3xl`}></div>
        <div className={`absolute top-1/3 right-1/3 w-40 h-40 ${darkMode ? 'bg-blue-900/30' : 'bg-journal-skyblue/20'} rounded-full blur-3xl`}></div>
        <div className="absolute animate-stars w-full h-full opacity-50"></div>
      </div>
      
      {showNav && <Navigation darkMode={darkMode} />}
      
      <main className="flex-grow p-4 md:p-6 pt-24 container mx-auto">
        {children}
      </main>
      
      <footer className={`p-4 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        <p className="font-serif italic">Our Journal - Where hearts connect 💕</p>
      </footer>
    </div>
  );
};

export default MainLayout;
