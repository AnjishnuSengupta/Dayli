import { uploadFile } from './src/lib/storage-smart.js';

// Test GIF upload function
async function testGifUpload() {
    try {
        // Create a simple test file with GIF mime type
        const testContent = new Uint8Array([
            0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // GIF89a header
            0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, // minimal GIF data
            0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00,
            0x2C, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00,
            0x02, 0x02, 0x04, 0x01, 0x00, 0x3B
        ]);
        
        const testFile = new File([testContent], 'test.gif', { type: 'image/gif' });
        
        console.log('Testing GIF upload with file:', {
            name: testFile.name,
            type: testFile.type,
            size: testFile.size
        });
        
        const result = await uploadFile(testFile, 'memories');
        console.log('✅ GIF upload successful:', result);
        return result;
        
    } catch (error) {
        console.error('❌ GIF upload failed:', error);
        throw error;
    }
}

// Test PNG upload for comparison
async function testPngUpload() {
    try {
        // Create a minimal PNG file
        const testContent = new Uint8Array([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 image
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE,
            0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, 0x54, // IDAT chunk
            0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01,
            0x02, 0x1A, 0x0D, 0xE2,
            0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, // IEND chunk
            0xAE, 0x42, 0x60, 0x82
        ]);
        
        const testFile = new File([testContent], 'test.png', { type: 'image/png' });
        
        console.log('Testing PNG upload with file:', {
            name: testFile.name,
            type: testFile.type,
            size: testFile.size
        });
        
        const result = await uploadFile(testFile, 'memories');
        console.log('✅ PNG upload successful:', result);
        return result;
        
    } catch (error) {
        console.error('❌ PNG upload failed:', error);
        throw error;
    }
}

// Run tests
window.testGifUpload = testGifUpload;
window.testPngUpload = testPngUpload;

console.log('Test functions loaded. Run testGifUpload() or testPngUpload() to test.');
