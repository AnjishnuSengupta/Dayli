// Universal User Service - MongoDB Only
import * as mongoUserService from './userService.mongodb';

export interface UserSettings {
  relationshipStartDate: string;
  darkMode: boolean;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
}

// Universal functions that use MongoDB backend
export const getUserSettings = async (userId?: string): Promise<UserSettings | null> => {
  console.log(`🔍 Getting user settings via MongoDB`);
  return mongoUserService.getUserSettings();
};

export const updateUserSettings = async (
  settings: Partial<UserSettings>, 
  userId?: string
): Promise<UserSettings> => {
  console.log(`🔄 Updating user settings via MongoDB`);
  return mongoUserService.updateUserSettings(settings);
};

export const updateUserProfile = async (
  profileData: { displayName?: string; photoURL?: string },
  currentUser?: unknown
): Promise<UserProfile> => {
  console.log(`🔄 Updating user profile via MongoDB`);
  return mongoUserService.updateUserProfile(profileData);
};

export const updateUserEmail = async (
  newEmail: string,
  currentUser?: unknown
): Promise<UserProfile> => {
  console.log(`🔄 Updating user email via MongoDB`);
  return mongoUserService.updateUserEmail(newEmail);
};

// Export a default userService object
export const userService = {
  getUserSettings,
  updateUserSettings,
  updateUserProfile,
  updateUserEmail,
};

export default userService;
