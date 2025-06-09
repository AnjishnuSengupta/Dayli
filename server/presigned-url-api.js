// Example API endpoint for generating pre-signed URLs for MinIO uploads
// This would typically be implemented in your backend server

const express = require('express');
const { Client } = require('minio');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

// Configure MinIO client
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'play.min.io',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'dayli-data';

// Ensure bucket exists
async function ensureBucketExists() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      console.log(`Bucket '${BUCKET_NAME}' created successfully.`);
      
      // Set bucket policy to allow public read
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };
      
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
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
app.post('/api/get-upload-url', async (req, res) => {
  try {
    const { fileName, contentType } = req.body;
    
    if (!fileName || !contentType) {
      return res.status(400).json({ error: 'fileName and contentType are required' });
    }
    
    // Generate pre-signed URL that expires in 10 minutes
    const presignedUrl = await minioClient.presignedPutObject(
      BUCKET_NAME,
      fileName,
      60 * 10 // 10 minutes expiry
    );
    
    return res.json({
      url: presignedUrl,
      bucket: BUCKET_NAME,
      key: fileName,
    });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Presigned URL server running on port ${PORT}`);
});

module.exports = app;
