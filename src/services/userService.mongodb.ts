import { apiClient } from "./apiClient";

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

export const getUserSettings = async (): Promise<UserSettings | null> => {
  console.log("🔍 Getting user settings from MongoDB API");
  
  const response = await apiClient.get<UserSettings>('/user/settings');
  
  if (response.error) {
    console.error("❌ Error fetching user settings:", response.error);
    return null;
  }
  
  console.log("✅ Successfully fetched user settings");
  return response.data || null;
};

export const updateUserSettings = async (settings: Partial<UserSettings>): Promise<UserSettings> => {
  console.log("🔄 Updating user settings in MongoDB API");
  
  const response = await apiClient.put<UserSettings>('/user/settings', settings);
  
  if (response.error) {
    console.error("❌ Error updating user settings:", response.error);
    throw new Error(response.error);
  }
  
  console.log("✅ User settings updated successfully");
  return response.data!;
};

export const updateUserProfile = async (profileData: { displayName?: string; photoURL?: string }): Promise<UserProfile> => {
  console.log("🔄 Updating user profile in MongoDB API");
  
  const response = await apiClient.put<UserProfile>('/user/profile', profileData);
  
  if (response.error) {
    console.error("❌ Error updating user profile:", response.error);
    throw new Error(response.error);
  }
  
  console.log("✅ User profile updated successfully");
  return response.data!;
};

export const updateUserEmail = async (newEmail: string): Promise<UserProfile> => {
  console.log("🔄 Updating user email in MongoDB API");
  
  const response = await apiClient.put<UserProfile>('/user/email', { email: newEmail });
  
  if (response.error) {
    console.error("❌ Error updating user email:", response.error);
    throw new Error(response.error);
  }
  
  console.log("✅ User email updated successfully");
  return response.data!;
};
