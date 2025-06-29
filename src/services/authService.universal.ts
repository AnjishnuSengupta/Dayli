// Universal Auth Service - MongoDB Only
import { apiClient } from './apiClient';

export interface UniversalUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
}

export interface AuthResponse {
  user: UniversalUser;
  token?: string;
}

// MongoDB Auth Functions
export const signUp = async (email: string, password: string, displayName: string): Promise<AuthResponse> => {
  console.log('🔐 Registering user with MongoDB backend');
  
  const response = await apiClient.post<AuthResponse>('/auth/register', {
    email,
    password,
    displayName
  });
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  // Store the JWT token and user data
  if (response.data?.token) {
    apiClient.setToken(response.data.token);
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user_data', JSON.stringify(response.data.user));
  }
  
  console.log('✅ MongoDB user registration successful');
  return response.data!;
};

export const logIn = async (email: string, password: string): Promise<AuthResponse> => {
  console.log('🔐 Logging in user with MongoDB backend');
  
  const response = await apiClient.post<AuthResponse>('/auth/login', {
    email,
    password
  });
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  // Store the JWT token and user data
  if (response.data?.token) {
    apiClient.setToken(response.data.token);
    localStorage.setItem('auth_token', response.data.token);
    localStorage.setItem('user_data', JSON.stringify(response.data.user));
  }
  
  console.log('✅ MongoDB user login successful');
  return response.data!;
};

export const logOut = async (): Promise<void> => {
  console.log('🔐 Logging out user');
  
  // Clear local storage
  apiClient.clearToken();
  localStorage.removeItem('user_data');
  
  console.log('✅ User logged out successfully');
};

export const updateUserProfile = async (displayName: string, photoURL?: string): Promise<UniversalUser> => {
  console.log('🔄 Updating user profile with MongoDB backend');
  
  const response = await apiClient.put<UniversalUser>('/user/profile', {
    displayName,
    photoURL
  });
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  // Update stored user data
  localStorage.setItem('user_data', JSON.stringify(response.data));
  
  console.log('✅ MongoDB user profile updated');
  return response.data!;
};

export const updateUserEmail = async (email: string): Promise<UniversalUser> => {
  console.log('🔄 Updating user email with MongoDB backend');
  
  const response = await apiClient.put<UniversalUser>('/user/email', {
    email
  });
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  // Update stored user data
  localStorage.setItem('user_data', JSON.stringify(response.data));
  
  console.log('✅ MongoDB user email updated');
  return response.data!;
};
