#!/bin/zsh
# Secure deployment script for Dayli app
# This script ensures that all security configurations are properly applied

echo "Starting secure deployment for Dayli app..."

# 1. Check for sensitive data in codebase
echo "Checking for sensitive data in codebase..."
grep -r "SECRET" --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" ./src || true
grep -r "KEY" --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" ./src || true
grep -r "PASSWORD" --include="*.ts" --include="*.js" --include="*.tsx" --include="*.jsx" ./src || true

read -p "⚠️ Review the above findings. Continue with deployment? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Deployment cancelled."
    exit 1
fi

# 2. Ensure environment variables are set
echo "Checking environment variables..."
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file with required variables (see .env.example)"
    exit 1
fi

# Check for required environment variables
required_vars=("VITE_FIREBASE_API_KEY" "VITE_FIREBASE_PROJECT_ID" "VITE_API_ENDPOINT")
missing_vars=0

for var in "${required_vars[@]}"
do
    if ! grep -q "$var=" .env; then
        echo "❌ Missing required environment variable: $var"
        missing_vars=$((missing_vars+1))
    fi
done

if [ $missing_vars -gt 0 ]; then
    echo "Please add the missing environment variables to your .env file"
    exit 1
fi

# 3. Install dependencies
echo "Installing dependencies..."
npm install

# 4. Run security audit
echo "Running security audit..."
npm audit --prod
audit_exit_code=$?

if [ $audit_exit_code -ne 0 ]; then
    echo "⚠️ Security vulnerabilities detected!"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]
    then
        echo "Deployment cancelled."
        exit 1
    fi
fi

# 5. Verify secure implementation
echo "Verifying secure storage implementation..."
if ! grep -q "secureUpload" ./src/lib/secure-storage.ts; then
    echo "❌ Error: Secure storage implementation not found!"
    exit 1
fi

if ! grep -q "useSecureStorage" ./src/hooks/use-secure-storage.ts; then
    echo "❌ Error: Secure storage hook not found!"
    exit 1
fi

echo "✅ Secure storage implementation verified."

# 6. Build the app
echo "Building the application..."
npm run build

# 6. Deploy Firebase security rules
echo "Deploying Firebase security rules..."
if command -v firebase &> /dev/null; then
    # Use the enhanced security rules instead of the default ones
    echo "Using enhanced security rules from firebase-enhanced.rules"
    cp firebase-enhanced.rules firebase.rules
    firebase deploy --only firestore:rules
else
    echo "⚠️ Firebase CLI not found. Please deploy security rules manually."
    echo "Run: cp firebase-enhanced.rules firebase.rules && firebase deploy --only firestore:rules"
fi

# 7. Set up secure headers for hosting
echo "Setting up secure headers..."
if [ -f "firebase.json" ]; then
    # Check if headers are already configured
    if ! grep -q "headers" firebase.json; then
        # Add security headers to firebase.json
        cat > /tmp/firebase-headers.json << EOL
{
  "hosting": {
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https://play.min.io https://*.s3.amazonaws.com https://*.googleapis.com https://*.gstatic.com https://firebasestorage.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://play.min.io https://*.s3.amazonaws.com https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com https://firestore.googleapis.com https://firebase.googleapis.com; frame-src 'self'; object-src 'none'"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          },
          {
            "key": "Permissions-Policy",
            "value": "geolocation=(), camera=(), microphone=(), payment=()"
          }
        ]
      }
    ]
  }
}
EOL
        echo "⚠️ Please update firebase.json with security headers from /tmp/firebase-headers.json"
    else
        echo "Security headers already configured in firebase.json"
    fi
else
    echo "⚠️ firebase.json not found. Please configure security headers manually."
fi

# 8. Start backend server
echo "Starting backend security services..."
echo "Starting secure storage API server..."
node server/secure-storage-api.js &
STORAGE_PID=$!

echo "Starting security monitoring service..."
node server/security-monitoring.js &
MONITORING_PID=$!

echo "✅ Deployment complete!"
echo "Security services are running with PIDs: $STORAGE_PID, $MONITORING_PID"
echo "To stop the services, run: kill $STORAGE_PID $MONITORING_PID"

exit 0
