import { mongoose } from '../lib/mongodb.js';

const memorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    required: true,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  imageMetadata: {
    originalName: String,
    size: Number,
    mimeType: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
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
memorySchema.index({ createdBy: 1, createdAt: -1 });
memorySchema.index({ createdBy: 1, isFavorite: 1 });

export interface IMemory {
  _id: string;
  title: string;
  date: string;
  caption: string;
  imageUrl: string;
  imageMetadata?: {
    originalName: string;
    size: number;
    mimeType: string;
  };
  createdBy: string;
  isFavorite: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const Memory = mongoose.models.Memory || mongoose.model<IMemory>('Memory', memorySchema);
