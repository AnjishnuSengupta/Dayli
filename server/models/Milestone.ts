import { mongoose } from '../lib/mongodb.js';

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  achieved: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isAutomatic: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['personal', 'professional', 'health', 'education', 'travel', 'other'],
    default: 'personal'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
milestoneSchema.index({ createdBy: 1, achieved: 1, createdAt: -1 });

export interface IMilestone {
  _id: string;
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

export const Milestone = mongoose.models.Milestone || mongoose.model<IMilestone>('Milestone', milestoneSchema);
