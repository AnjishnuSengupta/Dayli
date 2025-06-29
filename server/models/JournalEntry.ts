import { mongoose } from '../lib/mongodb.js';

const journalEntrySchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'neutral', 'sad', 'excited', 'tired', 'angry', 'surprised', 'love', 'amazing']
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
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
journalEntrySchema.index({ authorId: 1, createdAt: -1 });

export interface IJournalEntry {
  _id: string;
  content: string;
  mood: string;
  authorId: string;
  authorName: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const JournalEntry = mongoose.models.JournalEntry || mongoose.model<IJournalEntry>('JournalEntry', journalEntrySchema);
