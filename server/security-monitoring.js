/**
 * Security Monitoring Service for Dayli App
 * 
 * This script provides security monitoring, logging, and auditing for the Dayli app.
 * It monitors authentication events, file uploads, and potential security issues.
 */

import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { createClient } from 'redis';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { auth, db } from './firebase-admin';

dotenv.config();

// Initialize Express app with security middleware
const app = express();

// Apply security headers
app.use(helmet());

// CORS protection
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(apiLimiter);
app.use(express.json());

// Redis for real-time monitoring (optional)
const redisClient = process.env.REDIS_URL 
  ? createClient({ url: process.env.REDIS_URL })
  : null;

if (redisClient) {
  redisClient.connect().catch(console.error);
}

// Configure security log file
const LOG_DIR = process.env.LOG_DIR || './logs';
const SECURITY_LOG_FILE = path.join(LOG_DIR, 'security.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

/**
 * Log security events to file and Redis (if available)
 */
const logSecurityEvent = async (event) => {
  const timestamp = new Date().toISOString();
  const logEntry = JSON.stringify({
    timestamp,
    ...event
  });

  // Log to file
  fs.appendFileSync(SECURITY_LOG_FILE, logEntry + '\n');

  // Log to Redis for real-time monitoring if available
  if (redisClient) {
    try {
      await redisClient.lPush('security_events', logEntry);
      await redisClient.lTrim('security_events', 0, 999); // Keep last 1000 events
    } catch (error) {
      console.error('Redis logging error:', error);
    }
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[SECURITY EVENT] ${timestamp}: ${event.type} - ${event.message}`);
  }
};

/**
 * Listen for user account changes
 * This helps detect potential unauthorized account modifications
 */
const monitorUserAccounts = async () => {
  const firestore = getFirestore();
  
  firestore.collection('users')
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const data = change.doc.data();
        
        if (change.type === 'modified') {
          logSecurityEvent({
            type: 'USER_MODIFIED',
            userId: change.doc.id,
            message: 'User account modified',
            fields: Object.keys(data)
          });
        } else if (change.type === 'added') {
          logSecurityEvent({
            type: 'USER_CREATED',
            userId: change.doc.id,
            message: 'New user created'
          });
        } else if (change.type === 'removed') {
          logSecurityEvent({
            type: 'USER_DELETED',
            userId: change.doc.id,
            message: 'User account deleted'
          });
        }
      });
    }, (error) => {
      console.error('User monitoring error:', error);
    });
};

/**
 * Periodically check for suspicious activity
 */
const checkSuspiciousActivity = async () => {
  try {
    // Check for multiple failed login attempts
    const firestore = getFirestore();
    const now = Date.now();
    const fiveMinutesAgo = now - (5 * 60 * 1000);
    
    // Example: Check failed login attempts (if you're logging them)
    const failedLogins = await firestore.collection('security_events')
      .where('type', '==', 'LOGIN_FAILED')
      .where('timestamp', '>=', fiveMinutesAgo)
      .get();
    
    // Group by IP and userId
    const attemptsByIp = {};
    const attemptsByUser = {};
    
    failedLogins.forEach(doc => {
      const data = doc.data();
      
      // Count by IP
      if (data.ip) {
        attemptsByIp[data.ip] = (attemptsByIp[data.ip] || 0) + 1;
      }
      
      // Count by userId
      if (data.userId) {
        attemptsByUser[data.userId] = (attemptsByUser[data.userId] || 0) + 1;
      }
    });
    
    // Check for IPs with many failed attempts
    Object.entries(attemptsByIp).forEach(([ip, count]) => {
      if (count >= 5) {
        logSecurityEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          message: `Multiple failed login attempts from IP: ${ip}`,
          count,
          ip
        });
      }
    });
    
    // Check for accounts with many failed attempts
    Object.entries(attemptsByUser).forEach(([userId, count]) => {
      if (count >= 3) {
        logSecurityEvent({
          type: 'ACCOUNT_ATTACK',
          message: `Multiple failed login attempts for user: ${userId}`,
          count,
          userId
        });
      }
    });
  } catch (error) {
    console.error('Suspicious activity check error:', error);
  }
};

// Schedule regular checks
setInterval(checkSuspiciousActivity, 5 * 60 * 1000); // Every 5 minutes

/**
 * API Endpoint to get recent security events (admin only)
 */
app.get('/api/security/events', async (req, res) => {
  try {
    // Verify admin token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth.verifyIdToken(token);
    
    // Check if user is an admin
    const userRecord = await auth.getUser(decodedToken.uid);
    const isAdmin = userRecord.customClaims?.admin === true;
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    // Get events from Redis or log file
    let events = [];
    
    if (redisClient) {
      events = await redisClient.lRange('security_events', 0, 99); // Get last 100 events
      events = events.map(event => JSON.parse(event));
    } else {
      // Read from log file
      const log = fs.readFileSync(SECURITY_LOG_FILE, 'utf8');
      events = log.split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line))
        .slice(-100); // Last 100 events
    }
    
    return res.json({ events });
  } catch (error) {
    console.error('Error getting security events:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/security/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start monitoring
monitorUserAccounts().catch(console.error);

// Start server
const PORT = process.env.SECURITY_PORT || 3002;
app.listen(PORT, () => {
  console.log(`Security monitoring service running on port ${PORT}`);
  logSecurityEvent({
    type: 'SERVICE_START',
    message: 'Security monitoring service started'
  });
});

export default app;
