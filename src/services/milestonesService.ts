// MongoDB-only Milestones Service
import { apiClient } from './apiClient';

export interface Milestone {
  _id?: string;
  id?: string;
  title: string;
  date: string;
  description: string;
  achieved: boolean;
  createdBy: string;
  isAutomatic: boolean;
  category?: string;
  priority?: string;
  createdAt: Date;
}

export const addMilestone = async (milestone: Omit<Milestone, '_id' | 'id' | 'createdAt' | 'createdBy'>): Promise<Milestone> => {
  console.log('🎯 Adding milestone via MongoDB');
  const response = await apiClient.post('/milestones', milestone);
  return response.data as Milestone;
};

export const getMilestones = async (userId: string): Promise<Milestone[]> => {
  console.log('📋 Fetching milestones via MongoDB');
  const response = await apiClient.get('/milestones');
  const data = response.data as Milestone[];
  return data.map((milestone: Milestone) => ({
    ...milestone,
    id: milestone._id,
    createdAt: new Date(milestone.createdAt)
  }));
};

export const generateAutomaticMilestones = async (relationshipStartDate: Date, userId: string): Promise<Milestone[]> => {
  console.log('🤖 Generating automatic milestones');
  
  const milestones: Omit<Milestone, '_id' | 'id' | 'createdAt' | 'createdBy'>[] = [];
  const startDate = new Date(relationshipStartDate);
  const today = new Date();
  
  // Calculate days together
  const timeDiff = today.getTime() - startDate.getTime();
  const daysTogether = Math.floor(timeDiff / (1000 * 3600 * 24));
  
  // Generate milestones for completed intervals
  const intervals = [
    { days: 30, title: "First Month Together", description: "Celebrating our first month as a couple! 💕" },
    { days: 100, title: "100 Days Together", description: "100 days of love and laughter! 🎉" },
    { days: 365, title: "One Year Anniversary", description: "Our first year together - what an amazing journey! 🎂" },
    { days: 500, title: "500 Days Together", description: "500 days of growing closer and creating memories! ✨" },
    { days: 730, title: "Two Years Anniversary", description: "Two wonderful years of love and partnership! 💝" },
    { days: 1000, title: "1000 Days Together", description: "1000 days of love - and counting! 🌟" },
    { days: 1095, title: "Three Years Anniversary", description: "Three years of building our life together! 🏠" },
  ];
  
  for (const interval of intervals) {
    if (daysTogether >= interval.days) {
      const milestoneDate = new Date(startDate);
      milestoneDate.setDate(milestoneDate.getDate() + interval.days);
      
      milestones.push({
        title: interval.title,
        date: milestoneDate.toISOString().split('T')[0],
        description: interval.description,
        achieved: false,
        isAutomatic: true
      });
    }
  }
  
  return milestones as Milestone[];
};

export const deleteMilestone = async (milestoneId: string): Promise<void> => {
  console.log('🗑️ Deleting milestone via MongoDB');
  await apiClient.delete(`/milestones/${milestoneId}`);
};

export const updateMilestone = async (milestoneId: string, updates: Partial<Milestone>): Promise<Milestone> => {
  console.log('🔄 Updating milestone via MongoDB');
  const response = await apiClient.put(`/milestones/${milestoneId}`, updates);
  return response.data as Milestone;
};
