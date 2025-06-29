import { mongoose } from '../lib/mongodb.js';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  photoURL: {
    type: String,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  // User Settings
  relationshipStartDate: {
    type: String,
    default: ''
  },
  darkMode: {
    type: Boolean,
    default: false
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

export interface IUser {
  _id: string;
  email: string;
  password: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
  relationshipStartDate: string;
  darkMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
