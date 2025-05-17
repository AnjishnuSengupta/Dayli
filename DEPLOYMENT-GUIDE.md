# Dayli App Deployment Guide

## Overview

The Dayli app has been fixed to address multiple issues with Firebase permissions, MinIO storage, accessibility, and dark mode. This guide explains how to deploy the fixed version of the application.

## Setup Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/dayli.git
   cd dayli
   ```

2. **Install Dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file with the following variables:
   ```
   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id

   # MinIO Configuration
   VITE_MINIO_ENDPOINT=play.min.io
   VITE_MINIO_PORT=9000
   VITE_MINIO_USE_SSL=true
   VITE_MINIO_BUCKET_NAME=dayli-data
   VITE_MINIO_ACCESS_KEY=your_access_key
   VITE_MINIO_SECRET_KEY=your_secret_key
   ```

4. **Configure Firebase Security Rules**
   Deploy the Firebase security rules from `firebase.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Set Up MinIO Storage**
   Use the MinIO client to configure the bucket:
   ```bash
   # Install MinIO Client (mc) if needed
   # Configure MinIO alias
   mc alias set dayli-local $MINIO_ENDPOINT $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
   
   # Create bucket if it doesn't exist
   mc mb dayli-local/dayli-data
   
   # Set bucket permissions
   mc anonymous set download dayli-local/dayli-data
   ```

6. **Run Development Server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

7. **Build for Production**
   ```bash
   bun run build
   # or
   npm run build
   ```

## Fixed Issues

### 1. Firebase Permission Errors
- Added security rules to ensure users can only access their own data
- Modified queries to filter by user ID
- Fixed permission-related errors in all service files

### 2. MinIO Storage Issues
- Fixed content headers for image uploads
- Added error handling for storage operations
- Improved file validation and error messages
- Set correct permissions on the MinIO bucket

### 3. Accessibility Warnings
- Added proper dialog titles and descriptions
- Improved ARIA attributes for interactive elements
- Enhanced keyboard navigation support

### 4. Settings Page Issues
- Added validation for relationship start date
- Fixed dark mode toggle and persistence
- Improved profile picture upload process
- Enhanced form validation and error messages

### 5. Dashboard Component
- Fixed data fetching to use proper user filtering
- Improved error handling for data loading
- Enhanced dark mode compatibility

## After Deployment

1. **Test User Registration**
   - Create a new account and verify the signup process works
   - Check that email verification works (if enabled)

2. **Test Core Features**
   - Create journal entries and memories
   - Upload profile pictures
   - Toggle dark mode settings
   - Verify relationship milestones are calculated correctly

3. **Security Verification**
   - Ensure users can only see their own data
   - Verify authentication flows work correctly
   - Check that storage uploads are properly secured

4. **Performance Monitoring**
   - Set up Firebase Performance Monitoring
   - Monitor API calls and storage operations
   - Watch for any permission or storage errors in logs

## Troubleshooting

### Common Issues

1. **Firebase Permission Errors**
   - Check that security rules have been deployed
   - Verify that queries include user ID filters
   - Ensure users are authenticated before accessing data

2. **MinIO Upload Errors**
   - Verify MinIO endpoint is accessible
   - Check bucket permissions
   - Ensure correct content headers are set

3. **Dark Mode Not Working**
   - Clear browser cache and local storage
   - Verify class-based implementation is working
   - Check for CSS conflicts

## Support

For additional help or to report issues, please create an issue on the GitHub repository or contact the development team at support@dayli-app.com.
