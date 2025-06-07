# API Documentation

This document describes the API endpoints and services used in the Dayli application.

## Overview

Dayli uses a combination of client-side Firebase services and custom server-side APIs for enhanced functionality.

## Client-Side Services

### Authentication Service
Located in `src/services/authService.ts`

#### Functions
- `signUp(email, password)` - Create new user account
- `signIn(email, password)` - Authenticate user
- `signOut()` - Log out current user
- `getCurrentUser()` - Get current authenticated user

### Journal Service
Located in `src/services/journalService.ts`

#### `saveJournalEntry(userId: string, entry: JournalEntry)`
Creates a new journal entry for the specified user.

**Parameters:**
```typescript
interface JournalEntry {
  content: string;
  mood: 'happy' | 'sad' | 'excited' | 'calm' | 'anxious' | 'grateful';
  date: Date;
  authorId: string;
}
```

**Returns:** `Promise<void>`

#### `getJournalEntries(userId: string)`
Retrieves all journal entries for a user and their partner.

**Returns:** `Promise<JournalEntry[]>`

#### `updateJournalEntry(entryId: string, updates: Partial<JournalEntry>)`
Updates an existing journal entry (author only).

**Returns:** `Promise<void>`

#### `deleteJournalEntry(entryId: string)`
Deletes a journal entry (author only).

**Returns:** `Promise<void>`

### Memories Service
Located in `src/services/memoriesService.ts`

#### `uploadMemory(file: File, metadata: MemoryMetadata)`
Uploads a memory image with metadata.

**Parameters:**
```typescript
interface MemoryMetadata {
  title: string;
  description?: string;
  date: Date;
  location?: string;
  tags?: string[];
}
```

**Returns:** `Promise<Memory>`

#### `getMemories(userId: string)`
Retrieves all memories for a user and their partner.

**Returns:** `Promise<Memory[]>`

#### `deleteMemory(memoryId: string)`
Deletes a memory and its associated file.

**Returns:** `Promise<void>`

### Milestones Service
Located in `src/services/milestonesService.ts`

#### `saveMilestone(userId: string, milestone: Milestone)`
Creates a new relationship milestone.

**Parameters:**
```typescript
interface Milestone {
  title: string;
  description?: string;
  date: Date;
  category: 'anniversary' | 'achievement' | 'travel' | 'other';
  isPrivate?: boolean;
}
```

**Returns:** `Promise<void>`

#### `getMilestones(userId: string)`
Retrieves all milestones for a user and their partner.

**Returns:** `Promise<Milestone[]>`

## Server-Side API

### Base URL
Development: `http://localhost:3001/api`
Production: `https://your-domain.com/api`

### Authentication
All API endpoints require authentication via Firebase ID token:

```javascript
Authorization: Bearer <firebase_id_token>
```

### Endpoints

#### `POST /secure-upload`
Secure file upload endpoint with enhanced validation.

**Request:**
```javascript
// multipart/form-data
{
  file: File,
  metadata: {
    userId: string,
    type: 'memory' | 'profile',
    title?: string
  }
}
```

**Response:**
```javascript
{
  success: boolean,
  fileUrl: string,
  fileId: string
}
```

#### `DELETE /secure-delete/:fileId`
Securely delete an uploaded file.

**Parameters:**
- `fileId` - The ID of the file to delete

**Response:**
```javascript
{
  success: boolean,
  message: string
}
```

#### `GET /user-stats/:userId`
Get usage statistics for a user.

**Response:**
```javascript
{
  journalEntries: number,
  memories: number,
  milestones: number,
  storageUsed: number, // in bytes
  relationshipDays: number
}
```

#### `POST /backup-data`
Create a backup of user data.

**Request:**
```javascript
{
  userId: string,
  includeFiles: boolean
}
```

**Response:**
```javascript
{
  success: boolean,
  backupUrl: string,
  expiresAt: Date
}
```

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  lastLoginAt: Date;
  partnerId?: string;
  relationshipStartDate?: Date;
  settings: {
    notifications: boolean;
    privacy: 'private' | 'partner';
    theme: 'light' | 'dark' | 'auto';
  };
}
```

### Journal Entry
```typescript
interface JournalEntry {
  id: string;
  content: string;
  mood: 'happy' | 'sad' | 'excited' | 'calm' | 'anxious' | 'grateful';
  date: Date;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  isPrivate: boolean;
}
```

### Memory
```typescript
interface Memory {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  date: Date;
  location?: string;
  tags: string[];
  authorId: string;
  createdAt: Date;
  isPrivate: boolean;
}
```

### Milestone
```typescript
interface Milestone {
  id: string;
  title: string;
  description?: string;
  date: Date;
  category: 'anniversary' | 'achievement' | 'travel' | 'other';
  authorId: string;
  createdAt: Date;
  isPrivate: boolean;
}
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (invalid data)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `413` - Payload Too Large (file size exceeded)
- `422` - Unprocessable Entity (validation failed)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Error Response Format
```javascript
{
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

## Rate Limiting

### Limits
- **Authentication**: 5 attempts per minute per IP
- **File Upload**: 10 uploads per hour per user
- **API Calls**: 100 requests per 15 minutes per user
- **Database Writes**: 50 writes per minute per user

### Headers
Rate limit information is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Webhooks

### Events
The application can send webhooks for certain events:

#### `user.created`
Triggered when a new user signs up.

#### `milestone.created`
Triggered when a new milestone is added.

#### `memory.uploaded`
Triggered when a new memory is uploaded.

### Webhook Payload
```javascript
{
  event: string,
  timestamp: Date,
  userId: string,
  data: any
}
```

## SDKs and Libraries

### Client-Side Dependencies
- **Firebase SDK**: Authentication, Firestore, Storage
- **React Query**: Data fetching and caching
- **MinIO Client**: File upload to MinIO storage

### Server-Side Dependencies
- **Firebase Admin SDK**: Server-side Firebase operations
- **Express.js**: REST API framework
- **Multer**: File upload handling
- **MinIO SDK**: Server-side file operations

## Development

### Testing API Endpoints
Use the included test scripts:

```bash
# Run all API tests
npm run test:api

# Test specific endpoint
curl -X POST http://localhost:3001/api/secure-upload \
  -H "Authorization: Bearer $FIREBASE_TOKEN" \
  -F "file=@test.jpg" \
  -F "metadata={\"userId\":\"123\",\"type\":\"memory\"}"
```

### API Documentation Generation
API documentation is automatically generated from JSDoc comments:

```bash
npm run docs:api
```

This creates interactive documentation at `docs/api/index.html`.

## Migration

### Database Migrations
When data structure changes, use the migration scripts:

```bash
# Run pending migrations
npm run migrate

# Create new migration
npm run migrate:create <migration_name>
```

### API Versioning
The API uses path-based versioning:
- `/api/v1/` - Current stable version
- `/api/v2/` - Next version (when available)

Legacy versions are maintained for 6 months after deprecation.
