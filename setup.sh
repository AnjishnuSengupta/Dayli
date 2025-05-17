#!/bin/bash
# This script helps set up the Dayli app with proper configurations

echo "🌟 Setting up Dayli application..."

# Check if npm/bun is installed
if command -v bun &> /dev/null; then
    PACKAGE_MANAGER="bun"
elif command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
else
    echo "❌ Neither bun nor npm found. Please install one of them to continue."
    exit 1
fi

echo "📦 Using package manager: $PACKAGE_MANAGER"

# Install dependencies
echo "📦 Installing dependencies..."
$PACKAGE_MANAGER install

# Check if MC (MinIO Client) is installed
if ! command -v mc &> /dev/null; then
    echo "⚠️ MinIO Client (mc) not found."
    echo "👉 Please install MinIO Client to configure your storage:"
    echo "   https://docs.min.io/docs/minio-client-quickstart-guide.html"
else
    echo "✅ MinIO Client found."
    
    # Configure MinIO if environment variables are set
    if [[ -n "$MINIO_ENDPOINT" && -n "$MINIO_ACCESS_KEY" && -n "$MINIO_SECRET_KEY" ]]; then
        echo "🔧 Configuring MinIO..."
        mc alias set dayli-local $MINIO_ENDPOINT $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
        
        # Check if bucket exists, if not create it
        if ! mc ls dayli-local/dayli-data &> /dev/null; then
            echo "🪣 Creating dayli-data bucket..."
            mc mb dayli-local/dayli-data
        else
            echo "✅ dayli-data bucket already exists."
        fi
        
        # Set proper permissions
        echo "🔑 Setting bucket permissions..."
        mc anonymous set download dayli-local/dayli-data
    else
        echo "❓ No MinIO environment variables found. Skipping MinIO configuration."
    fi
fi

# Check for Firebase CLI
if ! command -v firebase &> /dev/null; then
    echo "⚠️ Firebase CLI not found."
    echo "👉 To deploy Firebase security rules, please install Firebase CLI:"
    echo "   npm install -g firebase-tools"
else
    echo "✅ Firebase CLI found."
    echo "👉 To deploy security rules, run:"
    echo "   firebase deploy --only firestore:rules"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file template..."
    cat > .env << EOF
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
EOF
    echo "⚠️ Please update the .env file with your actual credentials."
else
    echo "✅ .env file already exists."
fi

# Start the development server
echo "🚀 Setup complete! Starting development server..."
$PACKAGE_MANAGER run dev
