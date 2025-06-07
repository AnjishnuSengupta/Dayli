
/**
 * Secure authentication storage utility
 * Uses sessionStorage for session persistence without long-term cookies
 */

// Auth storage keys
const AUTH_KEY = 'auth_state';
const USER_KEY = 'auth_user';

// Auth session interface
interface AuthSession {
  isAuthenticated: boolean;
  expires: number; // Timestamp when this session expires
}

// User data interface for storage
interface StoredUserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  // Don't store sensitive data
}

// Save authentication state to session storage
export const saveAuthState = (isAuthenticated: boolean): void => {
  try {
    // Create session that expires in 8 hours
    const session: AuthSession = {
      isAuthenticated,
      expires: Date.now() + 1000 * 60 * 60 * 8, // 8 hours from now
    };
    
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
  } catch (err) {
    console.error('Failed to save auth state:', err);
  }
};

// Save user data to session storage
export const saveUserData = (userData: StoredUserData | null): void => {
  try {
    if (userData) {
      sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
    } else {
      sessionStorage.removeItem(USER_KEY);
    }
  } catch (err) {
    console.error('Failed to save user data:', err);
  }
};

// Get authentication state from session storage
export const getAuthState = (): boolean => {
  try {
    const sessionData = sessionStorage.getItem(AUTH_KEY);
    if (!sessionData) return false;
    
    const session: AuthSession = JSON.parse(sessionData);
    
    // Check if session is expired
    if (session.expires < Date.now()) {
      // Clear expired session
      clearAuthState();
      return false;
    }
    
    return session.isAuthenticated;
  } catch (err) {
    console.error('Failed to get auth state:', err);
    return false;
  }
};

// Get user data from session storage
export const getUserData = (): StoredUserData | null => {
  try {
    const userData = sessionStorage.getItem(USER_KEY);
    if (!userData) return null;
    
    return JSON.parse(userData);
  } catch (err) {
    console.error('Failed to get user data:', err);
    return null;
  }
};

// Clear authentication state and user data
export const clearAuthState = (): void => {
  try {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch (err) {
    console.error('Failed to clear auth state:', err);
  }
};

// Convert Firebase user to storable user data
export const createStorableUser = (user: { uid: string; email: string | null; displayName: string | null } | null): StoredUserData | null => {
  if (!user) return null;
  
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
};
