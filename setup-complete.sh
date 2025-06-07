#!/bin/bash
# Complete setup script for the Dayli application

set -e # Exit on error

echo "🌟 Dayli Application Setup Script 🌟"
echo "===================================="

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "⚠️  This script is designed for Linux. You may need to adjust commands for your OS."
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required tools
echo "📋 Checking required tools..."

# Check for package manager
if command_exists bun; then
    PACKAGE_MANAGER="bun"
elif command_exists npm; then
    PACKAGE_MANAGER="npm"
else
    echo "❌ Neither bun nor npm found. Please install one of them to continue."
    exit 1
fi
echo "✅ Using package manager: $PACKAGE_MANAGER"

# Check for Firebase CLI
if ! command_exists firebase; then
    echo "⚠️ Firebase CLI not installed."
    read -p "Would you like to install Firebase CLI globally? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📦 Installing Firebase CLI..."
        npm install -g firebase-tools
    else
        echo "⚠️ Skipping Firebase CLI installation. You'll need to manage Firebase deployments manually."
    fi
else
    echo "✅ Firebase CLI found."
fi

# Check for MinIO Client
if ! command_exists mc; then
    echo "⚠️ MinIO Client (mc) not installed."
    read -p "Would you like to install MinIO Client? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📦 Installing MinIO Client..."
        wget https://dl.min.io/client/mc/release/linux-amd64/mc -O mc
        chmod +x mc
        sudo mv mc /usr/local/bin/
    else
        echo "⚠️ Skipping MinIO Client installation. You'll need to manage MinIO configurations manually."
    fi
else
    echo "✅ MinIO Client found."
fi

# Install dependencies
echo "📦 Installing project dependencies..."
$PACKAGE_MANAGER install

# Check for .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file template..."
    cat > .env << EOF
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# MinIO Configuration
VITE_MINIO_ENDPOINT=play.min.io
VITE_MINIO_PORT=9000
VITE_MINIO_USE_SSL=true
VITE_MINIO_BUCKET_NAME=dayli-data
VITE_MINIO_ACCESS_KEY=
VITE_MINIO_SECRET_KEY=
EOF
    echo "⚠️ .env file created. Please edit it with your actual credentials."
    echo "🔍 You need to fill in the Firebase and MinIO credentials before proceeding."
    read -p "Press Enter when you have completed editing the .env file..." -r
else
    echo "✅ .env file already exists."
fi

# Source the .env file if it exists
if [ -f .env ]; then
    echo "📥 Loading environment variables from .env..."
    export $(grep -v '^#' .env | xargs)
fi

# Firebase setup
if command_exists firebase; then
    echo "🔥 Setting up Firebase..."
    
    # Check if user is logged in to Firebase
    FIREBASE_STATUS=$(firebase projects:list 2>&1 || echo "error")
    if [[ $FIREBASE_STATUS == *"please run firebase login"* ]] || [[ $FIREBASE_STATUS == *"error"* ]]; then
        echo "🔑 You need to log in to Firebase first."
        firebase login
    fi
    
    # Check if Firebase project is initialized
    if [ ! -f firebase.json ]; then
        echo "🚀 Initializing Firebase project..."
        firebase init firestore
    else
        echo "✅ Firebase project already initialized."
    fi
    
    # Deploy Firebase rules and indexes
    echo "📤 Deploying Firebase security rules and indexes..."
    firebase deploy --only firestore:rules,firestore:indexes
else
    echo "⚠️ Firebase CLI not available. Skipping Firebase setup."
    echo "👉 Please manually configure Firebase through the console using the files:"
    echo "   - firebase.rules"
    echo "   - firestore.indexes.json"
fi

# MinIO setup
if command_exists mc; then
    echo "🪣 Setting up MinIO storage..."
    
    # Check if we have MinIO credentials
    if [ -n "$VITE_MINIO_ACCESS_KEY" ] && [ -n "$VITE_MINIO_SECRET_KEY" ]; then
        echo "🔗 Configuring MinIO client..."
        mc alias set dayli-app \
            ${VITE_MINIO_ENDPOINT}:${VITE_MINIO_PORT} \
            ${VITE_MINIO_ACCESS_KEY} \
            ${VITE_MINIO_SECRET_KEY}
        
        # Check if bucket exists, if not create it
        if ! mc ls dayli-app/${VITE_MINIO_BUCKET_NAME} &> /dev/null; then
            echo "🛠️ Creating bucket ${VITE_MINIO_BUCKET_NAME}..."
            mc mb dayli-app/${VITE_MINIO_BUCKET_NAME}
        else
            echo "✅ Bucket ${VITE_MINIO_BUCKET_NAME} already exists."
        fi
        
        # Set proper permissions for the bucket
        echo "🔓 Setting bucket permissions..."
        mc anonymous set download dayli-app/${VITE_MINIO_BUCKET_NAME}
    else
        echo "⚠️ MinIO credentials not found in .env file. Skipping MinIO setup."
    fi
else
    echo "⚠️ MinIO Client not available. Skipping MinIO setup."
    echo "👉 Please manually configure your MinIO bucket through the MinIO console."
fi

# Final checks
echo "🔍 Performing final checks..."

# Check if crypto-js is installed
if ! grep -q "crypto-js" package.json; then
    echo "📦 Installing crypto-js for AWS Signature V4 functionality..."
    $PACKAGE_MANAGER install crypto-js @types/crypto-js --save
else
    echo "✅ crypto-js is already installed."
fi

# Run a build to check for errors
echo "🔨 Building the project to check for errors..."
$PACKAGE_MANAGER run build

echo "✨ Setup complete! ✨"
echo "You can now start the development server with:"
echo "  $PACKAGE_MANAGER run dev"
echo
echo "📚 Documentation available:"
echo "  - DEPLOYMENT-GUIDE.md - How to deploy the application"
echo "  - FIREBASE-INDEXES.md - Firestore index configuration guide"
echo "  - MINIO-AUTH.md - MinIO authentication guide"
echo "  - FIXES-SUMMARY.md - Summary of all fixes applied"
echo
echo "Happy coding! 🚀"
