# Setup Guide

This guide will walk you through setting up the Dayli application for development.

## Prerequisites

- Node.js 18+ or Bun
- Firebase project with Firestore and Authentication
- MinIO server (for file storage)
- Git

## Environment Configuration

### 1. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password provider)
3. Enable Firestore Database
4. Enable Storage
5. Get your Firebase configuration from Project Settings

### 2. MinIO Setup

1. Install MinIO server or use a cloud provider
2. Create a bucket for the application
3. Note your access credentials

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration (Client-side)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id

# MinIO Configuration (Client-side)
VITE_MINIO_ENDPOINT=your_minio_endpoint
VITE_MINIO_PORT=9000
VITE_MINIO_USE_SSL=false
VITE_MINIO_ACCESS_KEY=your_access_key
VITE_MINIO_SECRET_KEY=your_secret_key
VITE_MINIO_BUCKET_NAME=dayli-uploads

# MinIO Configuration (Server-side)
MINIO_ENDPOINT=your_minio_endpoint
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=your_access_key
MINIO_SECRET_KEY=your_secret_key
MINIO_BUCKET_NAME=dayli-uploads

# Server Configuration
SERVER_PORT=3001
NODE_ENV=development
API_SECRET_KEY=your_secret_api_key

# Firebase Admin SDK (Server-side)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
```

## Installation Steps

### Automatic Setup (Recommended)

Run the complete setup script:

```bash
chmod +x setup-complete.sh
./setup-complete.sh
```

This script will:
- Install dependencies
- Set up Firebase configuration
- Configure MinIO
- Initialize the database
- Run security tests

### Manual Setup

1. **Install Dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

2. **Configure Firebase**
   - Copy your Firebase config to `src/lib/firebase.ts`
   - Upload security rules from `firebase-enhanced.rules`

3. **Start Development Server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

4. **Start Server (if needed)**
   ```bash
   cd server
   npm start
   ```

## Firebase Security Rules

Upload the security rules from `firebase-enhanced.rules` to your Firebase project:

1. Go to Firestore Database → Rules
2. Copy the content from `firebase-enhanced.rules`
3. Publish the rules

## Verification

1. Open `http://localhost:8080` in your browser
2. Create a test account
3. Try creating a journal entry
4. Upload a test image to memories
5. Check that everything syncs properly

## Troubleshooting

### Common Issues

**Build Errors**
- Ensure all environment variables are set
- Check that Firebase config is correct
- Verify TypeScript configuration

**Authentication Issues**
- Check Firebase Authentication is enabled
- Verify API keys are correct
- Ensure security rules allow user operations

**File Upload Issues**
- Verify MinIO server is running
- Check bucket permissions
- Ensure credentials are correct

**Database Issues**
- Check Firestore security rules
- Verify user has proper permissions
- Look at browser console for errors

### Getting Help

1. Check the browser console for errors
2. Review Firebase logs in the console
3. Run the security test script: `./security-test.sh`
4. Check server logs if using server-side features

## Development Workflow

1. Make changes to the code
2. Test locally with `npm run dev`
3. Run security tests with `./security-test.sh`
4. Build for production with `npm run build`
5. Deploy using `./secure-deploy.sh`
