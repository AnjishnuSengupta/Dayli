/**
 * Secure API for MinIO/S3 storage operations
 * This server-side code handles pre-signed URLs and security validations
 * to keep credentials secure and enforce proper authorization.
 */
import express from 'express';
import { Client } from 'minio';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { createClient } from 'redis'; // For rate limiting
import { auth } from './firebase-admin'; // Firebase Admin SDK for authentication

dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

// Redis client for rate limiting
const redisClient = process.env.REDIS_URL 
  ? createClient({ url: process.env.REDIS_URL })
  : null;

if (redisClient) {
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  redisClient.connect().catch(console.error);
}

// Configure MinIO client
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'play.min.io',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'dayli-data';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Middleware to verify Firebase authentication
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Add the user ID to the request
    req.userId = decodedToken.uid;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Rate limiting middleware
const rateLimiter = async (req, res, next) => {
  if (!redisClient) {
    return next();
  }
  
  try {
    const userId = req.userId || 'anonymous';
    const uploadLimitKey = `upload-limit:${userId}`;
    const deleteLimitKey = `delete-limit:${userId}`;
    
    // Different limits for different operations
    const key = req.path.includes('/delete') ? deleteLimitKey : uploadLimitKey;
    const limit = req.path.includes('/delete') ? 20 : 50; // 50 uploads, 20 deletes per hour
    
    const current = await redisClient.get(key);
    const count = current ? parseInt(current) : 0;
    
    if (count >= limit) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    
    // Set rate limit with 1 hour expiry if not exists
    if (count === 0) {
      await redisClient.set(key, '1', { EX: 3600 });
    } else {
      await redisClient.incr(key);
    }
    
    next();
  } catch (error) {
    console.error('Rate limiting error:', error);
    next(); // Continue on error to avoid blocking legitimate requests
  }
};

// Validate upload type and permissions
const validateUploadPermissions = (req, res, next) => {
  const { uploadType, userId } = req.body;
  
  // Ensure the user ID in the request matches the authenticated user
  if (req.userId !== userId) {
    return res.status(403).json({ error: 'Forbidden: User ID mismatch' });
  }
  
  // Validate upload type
  const allowedUploadTypes = ['memories', 'profile_pictures'];
  if (!uploadType || !allowedUploadTypes.includes(uploadType)) {
    return res.status(400).json({ error: 'Invalid upload type' });
  }
  
  next();
};

// Validate file extension
const validateFileExtension = (req, res, next) => {
  const { fileName, contentType } = req.body;
  
  if (!fileName || !contentType) {
    return res.status(400).json({ error: 'Missing fileName or contentType' });
  }
  
  // Check if content type is an allowed image type
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'
  ];
  
  if (!allowedTypes.includes(contentType)) {
    return res.status(400).json({ error: 'Invalid content type. Only images are allowed.' });
  }
  
  // Check file extension matches content type
  const extension = path.extname(fileName).toLowerCase();
  const validExtensions = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'image/heic': ['.heic'],
    'image/heif': ['.heif']
  };
  
  if (!validExtensions[contentType]?.includes(extension)) {
    return res.status(400).json({ 
      error: 'File extension doesn\'t match content type'
    });
  }
  
  next();
};

// Ensure the bucket exists with proper permissions
async function ensureBucketExists() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, process.env.MINIO_REGION || 'us-east-1');
      console.log(`Bucket '${BUCKET_NAME}' created successfully.`);
      
      // Set bucket policy for secure access
      const bucketPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
            Condition: {
              StringLike: {
                'aws:Referer': [process.env.CLIENT_ORIGIN || '*']
              }
            }
          }
        ]
      };
      
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(bucketPolicy));
    }
  } catch (err) {
    console.error('Error ensuring bucket exists:', err);
  }
}

// Initialize server
(async () => {
  await ensureBucketExists();
})();

// Endpoint to generate pre-signed URL for uploads
app.post('/api/storage/presigned-url', 
  authenticateUser, 
  rateLimiter,
  validateUploadPermissions,
  validateFileExtension,
  async (req, res) => {
    try {
      const { fileName, contentType, userId, uploadType } = req.body;
      
      // Create secure object key (includes user ID)
      const objectKey = `${uploadType}/${userId}/${path.basename(fileName)}`;
      
      // Generate presigned URL with POST policy (more secure)
      const policy = minioClient.newPostPolicy();
      policy.setBucket(BUCKET_NAME);
      policy.setKey(objectKey);
      policy.setContentType(contentType);
      policy.setExpires(new Date(Date.now() + 10 * 60 * 1000)); // 10 minutes
      
      // Set max file size
      policy.setContentLengthRange(1, MAX_FILE_SIZE);
      
      const { postURL, formData } = await minioClient.presignedPostPolicy(policy);
      
      // Add server-generated metadata to track uploads
      formData['x-amz-meta-user-id'] = userId;
      formData['x-amz-meta-upload-type'] = uploadType;
      formData['x-amz-meta-original-name'] = path.basename(fileName);
      formData['x-amz-meta-timestamp'] = Date.now().toString();
      
      // Generate public URL to return to client
      const publicUrl = `${process.env.MINIO_PUBLIC_ENDPOINT || postURL.split('?')[0]}/${BUCKET_NAME}/${objectKey}`;
      
      return res.json({
        url: postURL,
        fields: formData,
        publicUrl
      });
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      return res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  }
);

// Endpoint to delete files
app.delete('/api/storage/delete', 
  authenticateUser,
  rateLimiter,
  async (req, res) => {
    try {
      const { filePath, userId } = req.body;
      
      if (!filePath) {
        return res.status(400).json({ error: 'Missing filePath' });
      }
      
      // Extract the object key from the path
      const parts = filePath.split('/');
      if (parts.length < 3) {
        return res.status(400).json({ error: 'Invalid file path' });
      }
      
      let objectKey = '';
      if (parts[1] === BUCKET_NAME) {
        // If path includes bucket name (e.g., /bucket-name/memories/user-id/file.jpg)
        objectKey = parts.slice(2).join('/');
      } else {
        // If path doesn't include bucket name (e.g., /memories/user-id/file.jpg)
        objectKey = parts.slice(1).join('/');
      }
      
      // Check if the user owns this file by checking if their user ID is in the path
      if (!objectKey.includes(userId)) {
        // Try to get object metadata to check ownership
        try {
          const stat = await minioClient.statObject(BUCKET_NAME, objectKey);
          const fileUserId = stat.metaData['x-amz-meta-user-id'];
          
          if (fileUserId !== userId) {
            return res.status(403).json({ error: 'You do not have permission to delete this file' });
          }
        } catch (statError) {
          // Can't verify ownership, deny access
          return res.status(403).json({ error: 'Cannot verify file ownership' });
        }
      }
      
      // Delete the object
      await minioClient.removeObject(BUCKET_NAME, objectKey);
      
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting file:', error);
      return res.status(500).json({ error: 'Failed to delete file' });
    }
  }
);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Storage API Server running on port ${PORT}`);
});

export default app;
