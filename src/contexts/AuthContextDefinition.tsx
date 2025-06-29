import { createContext } from 'react';
import * as universalAuth from '@/services/authService.universal';

export interface AuthContextType {
  currentUser: universalAuth.UniversalUser | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<universalAuth.AuthResponse>;
  logIn: (email: string, password: string) => Promise<universalAuth.AuthResponse>;
  logOut: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL: string | null) => Promise<void>;
  updateUserEmail: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);
