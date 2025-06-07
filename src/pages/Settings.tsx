import React, { useState, useRef, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import JournalCard from '../components/ui/JournalCard';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { User, updateProfile, updateEmail } from 'firebase/auth';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
// Remove the MinIO storage import and only use secure storage
import { useSecureStorage } from '@/hooks/use-secure-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Calendar, User as UserIcon, Mail, Camera, Loader2, Shield } from 'lucide-react';

// Interface for user settings data
interface UserSettings {
  relationshipStartDate: string;
  darkMode: boolean;
  userId?: string;
  createdAt?: Date;
}

const Settings = () => {
  const { currentUser, updateUserProfile, updateUserEmail } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [relationshipStartDate, setRelationshipStartDate] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentUser?.photoURL || null);
  const [isUploading, setIsUploading] = useState(false);
  const [dateError, setDateError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Use secure storage implementation
  const { upload } = useSecureStorage();
  
  const { toast: hookToast } = useToast();

  // Apply dark mode when the setting changes
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

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

  // Function to validate the relationship start date
  const validateDate = (dateString: string): boolean => {
    if (!dateString.trim()) {
      return true; // Empty is allowed
    }
    
    // Check if it's a valid date format
    const dateRegex = /^(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2},\s\d{4}$/;
    if (!dateRegex.test(dateString)) {
      setDateError("Please use format: Month Day, Year (e.g., August 29, 2025)");
      return false;
    }
    
    // Check if it's a valid date
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      setDateError("Please enter a valid date");
      return false;
    }
    
    // Date is valid
    setDateError('');
    return true;
  };

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
        
        // Check if document exists first
        const docSnap = await getDoc(userSettingsRef);
        
        if (docSnap.exists()) {
          // Update existing document
          await updateDoc(userSettingsRef, {
            relationshipStartDate,
            darkMode: isDarkMode,
            updatedAt: new Date()
          });
        } else {
          // Create new document with setDoc
          await setDoc(userSettingsRef, {
            relationshipStartDate,
            darkMode: isDarkMode,
            userId: currentUser.uid,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
        
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
    
    // Additional security validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile picture must be smaller than 5MB");
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error("Only image files are allowed for profile pictures");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Upload using secure storage implementation
      const userId = currentUser.uid;
      const renamedFile = new File([file], `${userId}_${Date.now()}.${file.name.split('.').pop()}`, {
        type: file.type
      });
      
      // Upload file and get URL with profile_pictures path prefix and user ID for access control
      const downloadURL = await upload(renamedFile, `profile_pictures/${userId}`);
      
      // Set new photo URL
      setPhotoUrl(downloadURL);
      
      // Immediately update the profile with the new photo
      await updateUserProfile(displayName, downloadURL);
      
      toast.success("Profile picture securely uploaded!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture: " + (error instanceof Error ? error.message : "Unknown error"));
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
    
    // Validate relationship date
    if (!validateDate(relationshipStartDate)) {
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
        <p className="text-gray-600 dark:text-gray-300">
          Customize your profile and preferences
        </p>
        <div className="flex items-center justify-center mt-2">
          <Shield className="text-green-500 mr-1" size={16} />
          <span className="text-xs text-green-500">Enhanced Security Enabled</span>
        </div>
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
                  onChange={(e) => {
                    setRelationshipStartDate(e.target.value);
                    setDateError(''); // Clear error on typing
                  }}
                  className={`input-field w-full ${dateError ? 'border-red-500' : ''}`}
                  placeholder="e.g., August 29, 2025"
                  onBlur={() => validateDate(relationshipStartDate)}
                />
                {dateError && (
                  <p className="text-xs text-red-500 mt-1">
                    {dateError}
                  </p>
                )}
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
                aria-label="Toggle dark mode"
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
