
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
import { toast } from 'sonner';
import { saveAuthState, saveUserData, clearAuthState, createStorableUser } from '@/utils/authStorage';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<UserCredential>;
  logIn: (email: string, password: string) => Promise<UserCredential>;
  logOut: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL: string | null) => Promise<void>;
  updateUserEmail: (email: string) => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | null>(null);

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
        
        // Save auth state and user data
        saveAuthState(true);
        saveUserData(createStorableUser(response.user));
      }
      
      toast.success("Account created successfully!");
      return response;
    } catch (error) {
      console.error("Error during signup:", error);
      clearAuthState();
      
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
      const response = await signInWithEmailAndPassword(auth, email, password);
      
      // Save auth state and user data
      saveAuthState(true);
      saveUserData(createStorableUser(response.user));
      
      toast.success("Logged in successfully!");
      return response;
    } catch (error) {
      console.error("Login error:", error);
      clearAuthState();
      
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
      
      // Clear auth state and user data
      clearAuthState();
      
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
      
      // Update stored user data
      saveUserData(createStorableUser(currentUser));
      
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
      
      // Update stored user data
      saveUserData(createStorableUser(currentUser));
      
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
      
      if (user) {
        // Update stored user data when auth state changes
        saveAuthState(true);
        saveUserData(createStorableUser(user));
      }
      
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
