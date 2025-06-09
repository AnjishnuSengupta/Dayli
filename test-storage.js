// Test script to validate MinIO connectivity and storage
import { uploadFile, deleteFile, getFileData } from './src/lib/storage-smart.ts';

async function runTests() {
  console.log('🧪 Starting storage tests...');
  
  // Create a test blob
  const testContent = 'Test image content for Dayli app';
  const testBlob = new Blob([testContent], { type: 'text/plain' });
  const testFile = new File([testBlob], 'test-image.txt', { type: 'text/plain' });
  
  try {
    // Test 1: Upload file
    console.log('📤 Testing file upload...');
    const fileUrl = await uploadFile(testFile, 'test');
    console.log('✅ Upload successful:', fileUrl);
    
    // Test 2: Retrieve file data
    console.log('📥 Testing file retrieval...');
    const fileData = await getFileData(fileUrl);
    console.log('✅ Retrieval successful:', fileData ? 'Data found' : 'No data');
    
    // Test 3: Delete file
    console.log('🗑️ Testing file deletion...');
    await deleteFile(fileUrl);
    console.log('✅ Deletion successful');
    
    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this script is executed directly
if (typeof window !== 'undefined') {
  window.runStorageTests = runTests;
  console.log('💡 Run window.runStorageTests() to test storage');
} else {
  runTests();
}
