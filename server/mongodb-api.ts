// Load environment variables from .env file
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import connectToDatabase from './lib/mongodb.js';
import { User } from './models/User.js';
import { JournalEntry } from './models/JournalEntry.js';
import { Memory } from './models/Memory.js';
import { Milestone } from './models/Milestone.js';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Extended Request interface for user authentication
interface AuthenticatedRequest extends Request {
  userId?: string;
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:8080'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Configure multer for file uploads (store in memory for base64 conversion)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Connect to MongoDB
connectToDatabase();

// Auth middleware
const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'MongoDB API Server is running', timestamp: new Date().toISOString() });
});

// Auth Routes
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, displayName } = req.body;

    // Validation
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      displayName
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Journal Routes
app.post('/api/journal', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content, mood } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const entry = new JournalEntry({
      content,
      mood,
      authorId: userId,
      authorName: user.displayName
    });

    await entry.save();
    res.status(201).json(entry);
  } catch (error) {
    console.error('Journal save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/journal', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const entries = await JournalEntry
      .find({ authorId: userId })
      .sort({ createdAt: -1 })
      .limit(100);
    
    res.json(entries);
  } catch (error) {
    console.error('Journal fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Memory Routes
app.post('/api/memories', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, date, caption, imageUrl, imageMetadata, tags } = req.body;
    const userId = req.userId;

    const memory = new Memory({
      title,
      date,
      caption,
      imageUrl,
      imageMetadata,
      tags,
      createdBy: userId
    });

    await memory.save();
    res.status(201).json(memory);
  } catch (error) {
    console.error('Memory save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/memories', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const memories = await Memory
      .find({ createdBy: userId })
      .sort({ createdAt: -1 });
    
    res.json(memories);
  } catch (error) {
    console.error('Memory fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Milestone Routes
app.post('/api/milestones', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, date, description, category, priority, achieved, isAutomatic } = req.body;
    const userId = req.userId;

    const milestone = new Milestone({
      title,
      date,
      description,
      category,
      priority,
      achieved: achieved !== undefined ? achieved : false,
      isAutomatic: isAutomatic !== undefined ? isAutomatic : false,
      createdBy: userId
    });

    await milestone.save();
    res.status(201).json(milestone);
  } catch (error) {
    console.error('Milestone save error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/milestones', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const milestones = await Milestone
      .find({ createdBy: userId })
      .sort({ createdAt: -1 });
    
    res.json(milestones);
  } catch (error) {
    console.error('Milestone fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// User Settings and Profile Routes
app.get('/api/user/settings', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For now, we'll store settings in the user document
    // In a larger app, you might want a separate UserSettings model
    const settings = {
      relationshipStartDate: user.relationshipStartDate || '',
      darkMode: user.darkMode || false,
      userId: user._id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.json(settings);
  } catch (error) {
    console.error('User settings fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/user/settings', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { relationshipStartDate, darkMode } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { 
        relationshipStartDate, 
        darkMode,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const settings = {
      relationshipStartDate: user.relationshipStartDate || '',
      darkMode: user.darkMode || false,
      userId: user._id,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json(settings);
  } catch (error) {
    console.error('User settings update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/user/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { displayName, photoURL } = req.body;

    const updateData: Partial<{ displayName: string; photoURL: string | null; updatedAt: Date }> = { updatedAt: new Date() };
    if (displayName) updateData.displayName = displayName;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    });
  } catch (error) {
    console.error('User profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/user/email', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { email } = req.body;

    // Check if email is already taken
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const user = await User.findByIdAndUpdate(
      userId, 
      { email, updatedAt: new Date() }, 
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    });
  } catch (error) {
    console.error('User email update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Image Upload Route
app.post('/api/upload', authenticateToken, upload.single('image'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Here you would typically process the file (e.g., save to cloud storage) 
    // and update the user or memory document with the file URL.

    // For demonstration, let's assume the file is processed and we have a URL
    const fileUrl = `https://your-storage-service.com/${file.filename}`;

    // Update user profile with new photo URL
    await User.findByIdAndUpdate(userId, { photoURL: fileUrl }, { new: true });

    res.json({ message: 'File uploaded successfully', url: fileUrl });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload endpoint for images
app.post('/api/upload/image', authenticateToken, upload.single('image'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const userId = req.userId;
    const { pathPrefix = 'uploads' } = req.body;

    // Convert image to base64 for permanent storage
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `${pathPrefix}/${userId}_${timestamp}_${req.file.originalname}`;
    
    // Create a simple image storage schema if it doesn't exist
    const imageSchema = new mongoose.Schema({
      filename: String,
      userId: String,
      data: String,
      originalName: String,
      mimetype: String,
      size: Number,
      createdAt: { type: Date, default: Date.now }
    });
    
    const ImageStorage = mongoose.models.ImageStorage || mongoose.model('ImageStorage', imageSchema);
    
    const imageDoc = new ImageStorage({
      filename: filename,
      userId: userId,
      data: base64Image,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });
    
    const savedImage = await imageDoc.save();
    
    // Return a stable URL that references the stored image
    const persistentImageUrl = `/api/images/${savedImage._id}`;

    res.json({
      url: persistentImageUrl,
      filename: filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      id: savedImage._id
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Image retrieval endpoint
app.get('/api/images/:imageId', async (req: Request, res: Response) => {
  try {
    const { imageId } = req.params;
    
    // Create the same schema for retrieval
    const imageSchema = new mongoose.Schema({
      filename: String,
      userId: String,
      data: String,
      originalName: String,
      mimetype: String,
      size: Number,
      createdAt: { type: Date, default: Date.now }
    });
    
    const ImageStorage = mongoose.models.ImageStorage || mongoose.model('ImageStorage', imageSchema);
    
    const imageDoc = await ImageStorage.findById(imageId);
    
    if (!imageDoc) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Return the base64 data directly
    res.json({
      data: imageDoc.data,
      filename: imageDoc.filename,
      mimetype: imageDoc.mimetype,
      size: imageDoc.size
    });
  } catch (error) {
    console.error('Image retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve image' });
  }
});

// Get current user profile
app.get('/api/user/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified
    });
  } catch (error) {
    console.error('User profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✅ MongoDB API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
