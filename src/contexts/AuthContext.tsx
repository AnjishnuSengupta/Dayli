
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updateEmail as firebaseUpdateEmail,
  UserCredential
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL: string | null) => Promise<void>;
  updateUserEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const response = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's profile with their display name
      if (response.user) {
        await updateProfile(response.user, {
          displayName: displayName
        });
      }
      
      toast.success("Account created successfully!");
    } catch (error) {
      console.error("Error during signup:", error);
      if (error instanceof Error) {
        toast.error(`Signup failed: ${error.message}`);
      } else {
        toast.error("Signup failed. Please try again.");
      }
      throw error;
    }
  };

  const logIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        toast.error(`Login failed: ${error.message}`);
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string, photoURL: string | null) => {
    if (!currentUser) throw new Error("No user is logged in");
    
    try {
      await updateProfile(currentUser, {
        displayName,
        photoURL: photoURL || undefined
      });
      
      // Force refresh the user object to get updated data
      setCurrentUser({ ...currentUser });
      return;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const updateUserEmail = async (email: string) => {
    if (!currentUser) throw new Error("No user is logged in");
    
    try {
      await firebaseUpdateEmail(currentUser, email);
      // Force refresh the user object
      setCurrentUser({ ...currentUser });
      return;
    } catch (error) {
      console.error("Error updating email:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signUp,
    logIn,
    logOut,
    updateUserProfile,
    updateUserEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
