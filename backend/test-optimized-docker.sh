#!/bin/bash

# Test optimized Docker build
echo "🧪 Testing optimized Docker build..."
echo "===================================="

# Clean up old images
echo "🧹 Cleaning up old images..."
docker rmi urine-analysis-api:latest 2>/dev/null || true
docker rmi urine-analysis-api:optimized 2>/dev/null || true

# Build optimized image
echo "🏗️  Building optimized Docker image..."
docker build -t urine-analysis-api:optimized .

# Check image size
echo "📏 Checking image size..."
docker images urine-analysis-api:optimized

# Test the container
echo "🚀 Testing container..."
docker run -d --name test-optimized -p 8001:8000 urine-analysis-api:optimized

# Wait and test
sleep 15
echo "🔍 Testing health check..."
if curl -f http://localhost:8001/ > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    docker logs test-optimized
fi

# Clean up
echo "🧹 Cleaning up test container..."
docker stop test-optimized
docker rm test-optimized

echo ""
echo "🎉 Optimized build test completed!"
echo "Compare the image size with the previous 5.65GB build."