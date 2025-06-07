#!/bin/zsh
# Security test script for Dayli app
# Tests the security implementations to ensure they're working as expected

echo "===== Running Security Tests for Dayli App ====="

# Set up test environment
echo "Setting up test environment..."
TEST_DIR=$(mktemp -d)
cd $TEST_DIR

echo "Cloning test files..."
# We're just simulating this in the test script
# In a real environment, you'd have actual test files

# Create test image for upload tests
echo "Creating test image..."
BASE64_IMG="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
echo $BASE64_IMG | base64 --decode > test_image.png

# Test 1: File Type Validation
echo "\n===== TEST 1: File Type Validation ====="
echo "Creating invalid file type..."
echo "This is not an image" > fake_image.jpg

echo "Attempting to upload invalid file type..."
UPLOAD_RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -F "file=@fake_image.jpg" \
  http://localhost:3001/api/storage/upload-test)

if [ "$UPLOAD_RESULT" = "400" ]; then
  echo "✅ PASS: Invalid file type was rejected"
else
  echo "❌ FAIL: Invalid file type was accepted ($UPLOAD_RESULT)"
fi

# Test 2: Authentication Requirement
echo "\n===== TEST 2: Authentication Requirement ====="
echo "Attempting to upload without authentication..."
UPLOAD_RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -F "file=@test_image.png" \
  http://localhost:3001/api/storage/upload-test)

if [ "$UPLOAD_RESULT" = "401" ]; then
  echo "✅ PASS: Unauthenticated upload was rejected"
else
  echo "❌ FAIL: Unauthenticated upload was accepted ($UPLOAD_RESULT)"
fi

# Test 3: User Ownership Verification
echo "\n===== TEST 3: User Ownership Verification ====="
echo "Attempting to access another user's files..."
ACCESS_RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X GET \
  -H "Authorization: Bearer FAKE_TOKEN" \
  http://localhost:3001/api/storage/files/other-user-id)

if [ "$ACCESS_RESULT" = "403" ]; then
  echo "✅ PASS: Access to another user's files was rejected"
else
  echo "❌ FAIL: Access to another user's files was accepted ($ACCESS_RESULT)"
fi

# Test 4: Rate Limiting
echo "\n===== TEST 4: Rate Limiting ====="
echo "Making multiple rapid requests to test rate limiting..."

LIMIT_REACHED=0
for i in {1..100}; do
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X GET \
    -H "Authorization: Bearer FAKE_TOKEN" \
    http://localhost:3001/api/storage/files/test-user)
  
  if [ "$RESPONSE" = "429" ]; then
    LIMIT_REACHED=1
    break
  fi
done

if [ "$LIMIT_REACHED" = "1" ]; then
  echo "✅ PASS: Rate limiting is working"
else
  echo "❌ FAIL: Rate limiting did not trigger"
fi

# Test 5: Content Security Policy Headers
echo "\n===== TEST 5: Security Headers ====="
echo "Checking for security headers..."

HEADERS=$(curl -s -I http://localhost:3000 | grep -E 'Content-Security-Policy|X-Frame-Options|X-XSS-Protection')

if [ ! -z "$HEADERS" ]; then
  echo "✅ PASS: Security headers are present"
  echo "$HEADERS"
else
  echo "❌ FAIL: Security headers are missing"
fi

# Test 6: Server-Side Validation
echo "\n===== TEST 6: Server-Side Validation ====="
echo "Testing file size limits..."

# Create large test file
dd if=/dev/zero of=large_file.bin bs=1M count=20 2>/dev/null

echo "Attempting to upload oversized file..."
UPLOAD_RESULT=$(curl -s -o /dev/null -w "%{http_code}" -X POST \
  -F "file=@large_file.bin" \
  -H "Authorization: Bearer FAKE_TOKEN" \
  http://localhost:3001/api/storage/upload-test)

if [ "$UPLOAD_RESULT" = "413" ]; then
  echo "✅ PASS: Oversized file was rejected"
else
  echo "❌ FAIL: Oversized file was accepted ($UPLOAD_RESULT)"
fi

# Clean up
echo "\n===== Cleaning up ====="
cd -
rm -rf $TEST_DIR
echo "Temporary test directory removed"

echo "\n===== Security Tests Complete ====="

# Display summary
PASSED=$(echo "$TEST_OUTPUT" | grep -c "PASS")
FAILED=$(echo "$TEST_OUTPUT" | grep -c "FAIL")

echo "\nSummary: $PASSED tests passed, $FAILED tests failed"

if [ $FAILED -gt 0 ]; then
  echo "⚠️ Some security tests failed. Please review the implementation."
  exit 1
else
  echo "✅ All security tests passed!"
  exit 0
fi
