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
  endPoint: process.env.VITE_MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.VITE_MINIO_PORT || '9000'),
  useSSL: process.env.VITE_MINIO_USE_SSL === 'true',
  accessKey: process.env.VITE_MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.VITE_MINIO_SECRET_KEY || 'minioadmin123',
});

const BUCKET_NAME = process.env.VITE_MINIO_BUCKET_NAME || 'dayli-uploads';

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
app.post('/api/presigned-url', async (req, res) => {
  try {
    const { fileName, fileType } = req.body;
    
    if (!fileName || !fileType) {
      return res.status(400).json({ error: 'fileName and fileType are required' });
    }
    
    // Generate pre-signed URL that expires in 10 minutes
    const presignedUrl = await minioClient.presignedPutObject(
      BUCKET_NAME,
      fileName,
      60 * 10 // 10 minutes expiry
    );
    
    // Generate the public URL for the uploaded file
    const fileUrl = `http://${process.env.VITE_MINIO_ENDPOINT || 'localhost'}:${process.env.VITE_MINIO_PORT || '9000'}/${BUCKET_NAME}/${fileName}`;
    
    return res.json({
      uploadUrl: presignedUrl,
      fileUrl: fileUrl,
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
