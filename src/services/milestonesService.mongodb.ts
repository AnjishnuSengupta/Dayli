import { apiClient } from "./apiClient";

export interface MongoMilestone {
  _id?: string;
  title: string;
  date: string;
  achieved: boolean;
  description?: string;
  createdBy: string;
  isAutomatic: boolean;
  category: 'personal' | 'professional' | 'health' | 'education' | 'travel' | 'other';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export const addMilestone = async (milestone: Omit<MongoMilestone, '_id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => {
  console.log("💾 Adding milestone to MongoDB API");
  
  const response = await apiClient.post<MongoMilestone>('/milestones', milestone);
  
  if (response.error) {
    console.error("❌ Error adding milestone:", response.error);
    throw new Error(response.error);
  }
  
  console.log("✅ Milestone added successfully");
  return response.data!._id;
};

export const getMilestones = async () => {
  console.log("🔍 Getting milestones from MongoDB API");
  
  const response = await apiClient.get<MongoMilestone[]>('/milestones');
  
  if (response.error) {
    console.error("❌ Error fetching milestones:", response.error);
    throw new Error(response.error);
  }
  
  const milestones = response.data || [];
  console.log("✅ Successfully fetched", milestones.length, "milestones");
  
  // Convert string dates back to Date objects and map _id to id
  return milestones.map(milestone => ({
    ...milestone,
    id: milestone._id,
    createdAt: new Date(milestone.createdAt)
  }));
};

export const updateMilestone = async (milestoneId: string, updates: Partial<MongoMilestone>) => {
  console.log("🔄 Updating milestone:", milestoneId);
  
  const response = await apiClient.put<MongoMilestone>(`/milestones/${milestoneId}`, updates);
  
  if (response.error) {
    console.error("❌ Error updating milestone:", response.error);
    throw new Error(response.error);
  }
  
  console.log("✅ Milestone updated successfully");
  return response.data;
};

export const deleteMilestone = async (milestoneId: string) => {
  console.log("🗑️ Deleting milestone:", milestoneId);
  
  const response = await apiClient.delete(`/milestones/${milestoneId}`);
  
  if (response.error) {
    console.error("❌ Error deleting milestone:", response.error);
    throw new Error(response.error);
  }
  
  console.log("✅ Milestone deleted successfully");
};
