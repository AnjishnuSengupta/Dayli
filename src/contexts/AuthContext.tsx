import React, { useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { saveAuthState, saveUserData, clearAuthState, createStorableUserFromUniversal } from '@/utils/authStorage';
import { signUp, logIn, logOut, updateUserProfile, updateUserEmail, UniversalUser } from '@/services/authService.universal';
import { AuthContext } from './AuthContextDefinition';

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UniversalUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(`🔐 Setting up auth listener for MongoDB backend`);
    
    // For MongoDB, check for stored auth token and user data
    const initMongoDB = () => {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setCurrentUser(user);
          saveAuthState(true);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          clearAuthState();
        }
      }
      
      setLoading(false);
    };
    
    initMongoDB();
  }, []);

  const handleSignUp = async (email: string, password: string, displayName: string) => {
    try {
      const response = await signUp(email, password, displayName);
      
      setCurrentUser(response.user);
      saveAuthState(true);
      saveUserData(createStorableUserFromUniversal(response.user));
      
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

  const handleLogIn = async (email: string, password: string) => {
    try {
      const response = await logIn(email, password);
      
      setCurrentUser(response.user);
      saveAuthState(true);
      saveUserData(createStorableUserFromUniversal(response.user));
      
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

  const handleLogOut = async () => {
    try {
      await logOut();
      
      setCurrentUser(null);
      clearAuthState();
      
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
      throw error;
    }
  };

  const handleUpdateUserProfile = async (displayName: string, photoURL: string | null) => {
    try {
      const updatedUser = await updateUserProfile(displayName, photoURL || undefined);
      
      setCurrentUser(updatedUser);
      saveUserData(createStorableUserFromUniversal(updatedUser));
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
      if (error instanceof Error) {
        toast.error(`Profile update failed: ${error.message}`);
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
      throw error;
    }
  };

  const handleUpdateUserEmail = async (email: string) => {
    try {
      const updatedUser = await updateUserEmail(email);
      
      setCurrentUser(updatedUser);
      saveUserData(createStorableUserFromUniversal(updatedUser));
      
      toast.success("Email updated successfully!");
    } catch (error) {
      console.error("Email update error:", error);
      if (error instanceof Error) {
        toast.error(`Email update failed: ${error.message}`);
      } else {
        toast.error("Failed to update email. Please try again.");
      }
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    signUp: handleSignUp,
    logIn: handleLogIn,
    logOut: handleLogOut,
    updateUserProfile: handleUpdateUserProfile,
    updateUserEmail: handleUpdateUserEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
