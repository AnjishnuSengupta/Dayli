
import React, { useState, useRef } from 'react';
import MainLayout from '../components/layout/MainLayout';
import JournalCard from '../components/ui/JournalCard';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { User, updateProfile, updateEmail } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useMinioStorage } from '@/hooks/use-minio-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar, User as UserIcon, Mail, Camera, Loader2 } from 'lucide-react';

// Interface for user settings data
interface UserSettings {
  relationshipStartDate: string;
  darkMode: boolean;
}

const Settings = () => {
  const { currentUser, updateUserEmail, updateUserProfile } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [relationshipStartDate, setRelationshipStartDate] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentUser?.photoURL || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { upload } = useMinioStorage(); // Use MinIO for storage
  
  const { toast: hookToast } = useToast();

  // Fetch user settings from Firestore
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['user-settings', currentUser?.uid],
    queryFn: async () => {
      if (!currentUser?.uid) return null;
      
      try {
        const docRef = doc(db, "user_settings", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as UserSettings;
          setRelationshipStartDate(data.relationshipStartDate || '');
          setIsDarkMode(data.darkMode || false);
          return data;
        }
        
        return {
          relationshipStartDate: '',
          darkMode: false
        };
      } catch (error) {
        console.error("Error fetching user settings:", error);
        toast.error("Couldn't load your settings");
        return null;
      }
    },
    enabled: !!currentUser?.uid
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser) throw new Error("Not authenticated");
      
      try {
        // Update profile (displayName and optionally photoURL)
        await updateUserProfile(displayName, photoUrl);
        
        // Update email if changed
        if (email !== currentUser.email) {
          await updateUserEmail(email);
        }
        
        // Update user settings in Firestore
        const userSettingsRef = doc(db, "user_settings", currentUser.uid);
        await updateDoc(userSettingsRef, {
          relationshipStartDate,
          darkMode: isDarkMode
        });
        
        return true;
      } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error("Failed to update profile: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  });

  // Handle profile picture upload
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentUser) return;
    
    const file = e.target.files[0];
    setIsUploading(true);
    
    try {
      // Upload to MinIO instead of Firebase Storage
      const userId = currentUser.uid;
      const renamedFile = new File([file], `${userId}_${Date.now()}.${file.name.split('.').pop()}`, {
        type: file.type
      });
      
      // Upload file and get URL with profile_pictures path prefix
      const downloadURL = await upload(renamedFile, 'profile_pictures');
      
      // Set new photo URL
      setPhotoUrl(downloadURL);
      toast.success("Profile picture uploaded!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
    }
  };

  // Save all settings
  const saveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!displayName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    
    if (!email.trim() || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    updateProfileMutation.mutate();
  };

  return (
    <MainLayout>
      <section className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-serif mb-2">
          Your Settings
        </h1>
        <p className="text-gray-600">
          Customize your profile and preferences
        </p>
      </section>
      
      <form onSubmit={saveSettings}>
        {/* Profile Information */}
        <section className="mb-8">
          <JournalCard className="p-6">
            <h2 className="text-xl font-serif mb-6 flex items-center gap-2">
              <UserIcon className="text-journal-lavender" /> 
              Profile Information
            </h2>
            
            {/* Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <div 
                className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center relative overflow-hidden mb-2 border border-gray-200"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="animate-spin text-journal-lavender" />
                ) : photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserIcon size={32} className="text-gray-400" />
                )}
                
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="text-white" />
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <button
                type="button"
                className="text-sm text-journal-lavender hover:underline"
                onClick={() => fileInputRef.current?.click()}
              >
                Change profile picture
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Your Name
                </label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field w-full"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full"
                  placeholder="Your email"
                />
              </div>
            </div>
          </JournalCard>
        </section>
        
        {/* Relationship Settings */}
        <section className="mb-8">
          <JournalCard className="p-6">
            <h2 className="text-xl font-serif mb-6 flex items-center gap-2">
              <Calendar className="text-journal-blush" /> 
              Relationship Settings
            </h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="rel-date" className="block text-sm font-medium mb-1">
                  Relationship Start Date
                </label>
                <Input
                  id="rel-date"
                  type="text"
                  value={relationshipStartDate}
                  onChange={(e) => setRelationshipStartDate(e.target.value)}
                  className="input-field w-full"
                  placeholder="e.g., August 29, 2025"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This date will be used to calculate milestones
                </p>
              </div>
            </div>
          </JournalCard>
        </section>
        
        {/* App Preferences */}
        <section className="mb-8">
          <JournalCard className="p-6">
            <h2 className="text-xl font-serif mb-6">
              App Preferences
            </h2>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Dark Mode</h3>
                <p className="text-sm text-gray-500">Enable dark mode for the app</p>
              </div>
              <Switch 
                checked={isDarkMode}
                onCheckedChange={setIsDarkMode}
              />
            </div>
          </JournalCard>
        </section>
        
        <div className="flex justify-end mb-12">
          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="btn-primary px-6"
          >
            {updateProfileMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                Saving...
              </span>
            ) : 'Save Settings'}
          </button>
        </div>
      </form>
    </MainLayout>
  );
};

export default Settings;
