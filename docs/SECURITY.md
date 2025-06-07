# Security Guide

This document outlines the security measures implemented in the Dayli application.

## Overview

Dayli implements multiple layers of security to protect user data and ensure privacy between couples.

## Firebase Security Rules

### Database Security (Firestore)

The application uses comprehensive Firestore security rules located in `firebase-enhanced.rules`:

#### User Data Protection
- Users can only read/write their own user documents
- Partner access is controlled through verified relationships
- All operations require authentication

#### Journal Entries
- Only the author and their verified partner can read entries
- Entries can only be modified by their author
- Strict validation on entry structure and timestamps

#### Memories and Milestones
- Similar partner-based access control
- File metadata validation
- Timestamp verification for all operations

#### Key Security Functions

```javascript
// Partner verification
function isPartner(resource) {
  return request.auth != null && 
         resource.data.partnerIds != null && 
         request.auth.uid in resource.data.partnerIds;
}

// Timestamp validation
function isValidTimestampField(timeValue) {
  return timeValue is timestamp && 
         timeValue.toMillis() >= (request.time.toMillis() - 5 * 60 * 1000) && 
         timeValue.toMillis() <= (request.time.toMillis() + 60 * 1000);
}

// User data validation
function isValidUserData(userData) {
  return userData.keys().hasAll(['email', 'createdAt']) &&
         userData.email is string &&
         isValidTimestampField(userData.createdAt);
}
```

## File Upload Security

### MinIO Configuration
- Secure access key management
- Bucket-level permissions
- File type validation

### Client-Side Validation
- File type restrictions (images only for memories)
- File size limits
- Content validation before upload

### Server-Side Protection
```typescript
// File type validation
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const isValidFileType = (file: File) => allowedTypes.includes(file.type);

// Size validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const isValidFileSize = (file: File) => file.size <= MAX_FILE_SIZE;
```

## Authentication Security

### Firebase Authentication
- Email/password authentication with strong password requirements
- Secure session management
- Automatic token refresh

### Session Protection
```typescript
// Auth state persistence
const auth = getAuth();
setPersistence(auth, browserLocalPersistence);

// Automatic logout on token expiry
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // Redirect to login
    window.location.href = '/login';
  }
});
```

## Data Validation

### Input Sanitization
All user inputs are validated and sanitized:

```typescript
// Journal entry validation
const validateJournalEntry = (entry: JournalEntry) => {
  return {
    content: DOMPurify.sanitize(entry.content),
    mood: entry.mood.toLowerCase(),
    date: new Date(entry.date).toISOString(),
    authorId: entry.authorId // Verified against current user
  };
};
```

### Server-Side Validation
- All API endpoints validate input data
- Protection against injection attacks
- Rate limiting on sensitive operations

## Environment Security

### Environment Variables
Sensitive configuration is managed through environment variables:

```env
# Never commit these to version control
FIREBASE_ADMIN_PRIVATE_KEY=xxx
MINIO_SECRET_KEY=xxx
API_SECRET_KEY=xxx
```

### Build Security
- Production builds exclude development tools
- Source maps are not included in production
- Environment variables are properly scoped (VITE_ prefix for client-side)

## API Security

### Server Endpoints
Located in `server/` directory with the following protections:

#### Authentication Middleware
```javascript
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

#### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

## Security Testing

### Automated Tests
Run security tests with:
```bash
./security-test.sh
```

This script tests:
- File upload validation
- Authentication bypass attempts
- Database access control
- Input sanitization
- Rate limiting

### Manual Security Checks
1. **Authentication Testing**
   - Try accessing protected routes without login
   - Test token expiry handling
   - Verify partner access restrictions

2. **File Upload Testing**
   - Upload various file types
   - Test file size limits
   - Verify metadata validation

3. **Database Security**
   - Attempt cross-user data access
   - Test malformed data insertion
   - Verify timestamp validation

## Security Best Practices

### For Developers
1. **Never hardcode secrets** in source code
2. **Validate all inputs** on both client and server
3. **Use HTTPS** in production
4. **Keep dependencies updated** regularly
5. **Follow least privilege principle** for database access

### For Deployment
1. **Use secure deployment script**: `./secure-deploy.sh`
2. **Enable Firebase security monitoring**
3. **Set up proper CORS policies**
4. **Configure SSL certificates**
5. **Monitor for security alerts**

## Incident Response

### Security Issue Reporting
If you discover a security vulnerability:
1. **Do not** create a public issue
2. Contact the maintainers privately
3. Provide detailed reproduction steps
4. Allow time for investigation and fix

### Emergency Procedures
1. **Immediate response**: Disable affected features
2. **Investigation**: Identify scope and impact
3. **Mitigation**: Apply temporary fixes
4. **Resolution**: Implement permanent solution
5. **Communication**: Notify affected users

## Compliance

### Data Protection
- User data is encrypted at rest
- Minimal data collection (only what's necessary)
- User controls for data deletion
- Partner data separation and access control

### Privacy Features
- No data sharing with third parties
- Local storage minimization
- Secure partner verification process
- Option to delete all data when ending relationship

## Monitoring

### Security Logs
- Firebase Authentication logs
- Firestore access logs
- File upload activity
- Failed authentication attempts

### Alerts
Set up monitoring for:
- Unusual access patterns
- Failed authentication spikes
- Large file uploads
- Database rule violations

This security guide should be reviewed and updated regularly as the application evolves.
