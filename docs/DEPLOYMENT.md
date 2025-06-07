# Deployment Guide

This guide covers deploying the Dayli application to production environments.

## Prerequisites

- Production Firebase project
- MinIO server or S3-compatible storage
- Domain name with SSL certificate
- Server with Node.js 18+ support

## Environment Setup

### Production Environment Variables

Create a `.env.production` file:

```env
# Firebase Configuration (Production)
VITE_FIREBASE_API_KEY=prod_api_key
VITE_FIREBASE_AUTH_DOMAIN=dayli-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dayli-prod
VITE_FIREBASE_STORAGE_BUCKET=dayli-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=prod_app_id

# MinIO Configuration (Production)
VITE_MINIO_ENDPOINT=storage.your-domain.com
VITE_MINIO_PORT=443
VITE_MINIO_USE_SSL=true
VITE_MINIO_ACCESS_KEY=prod_access_key
VITE_MINIO_SECRET_KEY=prod_secret_key
VITE_MINIO_BUCKET_NAME=dayli-prod-uploads

# Server Configuration (Production)
MINIO_ENDPOINT=storage.your-domain.com
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=prod_access_key
MINIO_SECRET_KEY=prod_secret_key
MINIO_BUCKET_NAME=dayli-prod-uploads

SERVER_PORT=3001
NODE_ENV=production
API_SECRET_KEY=secure_random_key_here

# Firebase Admin SDK (Production)
FIREBASE_ADMIN_PROJECT_ID=dayli-prod
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk@dayli-prod.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Deployment Methods

### Method 1: Automated Deployment (Recommended)

Use the secure deployment script:

```bash
chmod +x secure-deploy.sh
./secure-deploy.sh
```

This script will:
1. Run security checks
2. Build the application
3. Test the production build
4. Deploy to your server
5. Verify deployment

### Method 2: Manual Deployment

#### Step 1: Build the Application

```bash
# Install dependencies
npm ci --production

# Build for production
npm run build

# Test the build
npm run preview
```

#### Step 2: Deploy Frontend

**Option A: Static Hosting (Recommended)**

Deploy to services like Netlify, Vercel, or Firebase Hosting:

```bash
# Firebase Hosting
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy

# Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist

# Vercel CLI
npm install -g vercel
vercel --prod
```

**Option B: Traditional Server**

```bash
# Copy build files to server
scp -r dist/* user@your-server:/var/www/dayli/

# Configure nginx
sudo nano /etc/nginx/sites-available/dayli
```

Nginx configuration:
```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    root /var/www/dayli;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 3: Deploy Backend API

```bash
# Copy server files
scp -r server/ user@your-server:/opt/dayli-api/

# Install dependencies on server
ssh user@your-server
cd /opt/dayli-api
npm ci --production

# Set up PM2 for process management
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'dayli-api',
    script: './server/index.js',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

## Security Configuration

### SSL/TLS Setup

Ensure HTTPS is properly configured:

```bash
# Let's Encrypt with Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Firewall Configuration

```bash
# Configure UFW (Ubuntu)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Security Headers

Add security headers to your nginx configuration:

```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.your-domain.com wss://api.your-domain.com;";
```

## Database Configuration

### Firebase Production Setup

1. **Enable Production Security Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

2. **Set up Firestore Indexes**
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Configure Backup**
   ```bash
   # Set up automated backups
   gcloud firestore export gs://your-backup-bucket
   ```

### MinIO Production Setup

1. **Create Production Bucket**
   ```bash
   mc alias set myprod https://storage.your-domain.com ACCESS_KEY SECRET_KEY
   mc mb myprod/dayli-prod-uploads
   mc policy set public myprod/dayli-prod-uploads
   ```

2. **Configure Lifecycle Policies**
   ```bash
   mc ilm add --expiry-days 365 myprod/dayli-prod-uploads
   ```

## Monitoring and Logging

### Application Monitoring

Set up monitoring with PM2:

```bash
# Monitor processes
pm2 monit

# Set up log rotation
pm2 install pm2-logrotate
```

### Error Tracking

Integrate error tracking (e.g., Sentry):

```bash
npm install @sentry/react @sentry/node
```

Add to your application:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
});
```

### Health Checks

Create health check endpoints:

```javascript
// server/health.js
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## Performance Optimization

### Frontend Optimization

1. **Enable Compression**
   ```nginx
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml+rss text/javascript;
   ```

2. **Cache Static Assets**
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

### Database Optimization

1. **Firestore Indexes**
   - Create composite indexes for complex queries
   - Monitor query performance

2. **Connection Pooling**
   ```javascript
   // Configure Firebase Admin connection limits
   const admin = require('firebase-admin');
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount),
     databaseURL: `https://${projectId}.firebaseio.com`,
     maxPoolSize: 10
   });
   ```

## Backup and Recovery

### Automated Backups

Create backup script:
```bash
#!/bin/bash
# backup.sh

# Backup Firestore
gcloud firestore export gs://your-backup-bucket/$(date +%Y%m%d)

# Backup MinIO
mc mirror myprod/dayli-prod-uploads backup-storage/$(date +%Y%m%d)

# Cleanup old backups (keep 30 days)
find backup-storage/ -type d -mtime +30 -exec rm -rf {} \;
```

Schedule with cron:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup.sh
```

### Recovery Procedures

1. **Database Recovery**
   ```bash
   # Restore from backup
   gcloud firestore import gs://your-backup-bucket/20231201
   ```

2. **File Recovery**
   ```bash
   # Restore files
   mc mirror backup-storage/20231201 myprod/dayli-prod-uploads
   ```

## Domain and DNS

### DNS Configuration

```
# A Records
your-domain.com         IN A    your-server-ip
www.your-domain.com     IN A    your-server-ip
api.your-domain.com     IN A    your-server-ip
storage.your-domain.com IN A    your-minio-server-ip

# CNAME Records (if using CDN)
cdn.your-domain.com     IN CNAME your-cdn-provider.com
```

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf node_modules dist
   npm ci
   npm run build
   ```

2. **CORS Issues**
   ```javascript
   // Add CORS configuration
   app.use(cors({
     origin: ['https://your-domain.com', 'https://www.your-domain.com'],
     credentials: true
   }));
   ```

3. **Firebase Connection Issues**
   ```bash
   # Verify service account permissions
   gcloud auth activate-service-account --key-file=service-account.json
   gcloud firestore databases describe --database="(default)"
   ```

### Log Analysis

```bash
# Check application logs
pm2 logs dayli-api

# Check nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Check system logs
journalctl -u nginx -f
```

## Post-Deployment Checklist

- [ ] SSL certificate is installed and working
- [ ] All environment variables are set correctly
- [ ] Firebase security rules are deployed
- [ ] Database indexes are created
- [ ] File uploads are working
- [ ] Authentication flow works end-to-end
- [ ] Error tracking is configured
- [ ] Monitoring is set up
- [ ] Backups are scheduled
- [ ] Performance is optimized
- [ ] Security headers are configured
- [ ] Health checks are responding

## Maintenance

### Regular Tasks

1. **Weekly**
   - Review error logs
   - Check backup integrity
   - Monitor performance metrics

2. **Monthly**
   - Update dependencies
   - Review security logs
   - Test backup recovery

3. **Quarterly**
   - Security audit
   - Performance optimization review
   - Infrastructure cost analysis

### Updates and Patches

```bash
# Update application
git pull origin main
npm ci
npm run build
pm2 reload dayli-api

# Update system packages
sudo apt update && sudo apt upgrade
```

This deployment guide ensures a secure, scalable, and maintainable production environment for the Dayli application.
