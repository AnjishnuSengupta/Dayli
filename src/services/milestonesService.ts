
import { db } from "../lib/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp, 
  Timestamp 
} from "firebase/firestore";

export interface Milestone {
  id?: string;
  title: string;
  date: string;
  achieved: boolean;
  description?: string;
  createdAt: Timestamp;
  createdBy: string;
  isAutomatic?: boolean;
}

export const addMilestone = async (milestone: Omit<Milestone, 'id' | 'createdAt'>) => {
  const milestoneData = {
    ...milestone,
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(collection(db, "milestones"), milestoneData);
  return docRef.id;
};

export const getMilestones = async () => {
  const q = query(
    collection(db, "milestones"),
    orderBy("createdAt")
  );
  
  const querySnapshot = await getDocs(q);
  
  const milestones: Milestone[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data() as Omit<Milestone, 'id'>;
    milestones.push({
      id: doc.id,
      ...data
    });
  });
  
  return milestones;
};

export const generateAutomaticMilestones = async (startDate: Date, userId: string) => {
  // Get existing automatic milestones
  const q = query(
    collection(db, "milestones"),
    orderBy("createdAt")
  );
  
  const querySnapshot = await getDocs(q);
  const existingMilestones = new Set();
  
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.isAutomatic) {
      existingMilestones.add(data.title);
    }
  });
  
  const today = new Date();
  const daysSince = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const automaticMilestones = [
    {
      title: 'Day 1',
      date: startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      achieved: true,
      description: 'The day it all began',
      createdBy: userId,
      isAutomatic: true
    },
    {
      title: 'Week 1',
      date: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      achieved: daysSince >= 7,
      description: 'One week together',
      createdBy: userId,
      isAutomatic: true
    },
    {
      title: 'Month 1',
      date: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      achieved: daysSince >= 30,
      description: 'One month of happiness',
      createdBy: userId,
      isAutomatic: true
    },
    {
      title: '100 Days',
      date: new Date(startDate.getTime() + 100 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      achieved: daysSince >= 100,
      description: '100 days of beautiful memories',
      createdBy: userId,
      isAutomatic: true
    }
  ];
  
  // Only add milestones that don't exist yet
  for (const milestone of automaticMilestones) {
    if (!existingMilestones.has(milestone.title)) {
      await addMilestone(milestone);
    }
  }
};
