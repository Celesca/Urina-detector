#!/bin/bash

# Test script for Urine Analysis API Docker deployment
# This script builds and tests the Docker container locally

echo "🧪 Testing Urine Analysis API Docker deployment..."
echo "=================================================="

# Build the Docker image
echo "🏗️  Building Docker image..."
docker build -t urine-analysis-api:test .

# Run the container
echo "🚀 Starting container..."
docker run -d \
    --name urine-analysis-test \
    -p 8000:8000 \
    -e HOST=0.0.0.0 \
    -e PORT=8000 \
    urine-analysis-api:test

# Wait for the container to start
echo "⏳ Waiting for container to start..."
sleep 10

# Test health check
echo "🔍 Testing health check..."
if curl -f http://localhost:8000/ > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    docker logs urine-analysis-test
    docker stop urine-analysis-test
    docker rm urine-analysis-test
    exit 1
fi

# Test API documentation
echo "📖 Testing API documentation..."
if curl -f http://localhost:8000/docs > /dev/null 2>&1; then
    echo "✅ API documentation accessible!"
else
    echo "❌ API documentation not accessible!"
fi

# Test model info endpoint
echo "🤖 Testing model info endpoint..."
MODEL_INFO=$(curl -s http://localhost:8000/model/info)
if echo "$MODEL_INFO" | grep -q "HybridModel"; then
    echo "✅ Model info endpoint working!"
    echo "Model Info: $MODEL_INFO"
else
    echo "❌ Model info endpoint failed!"
    echo "Response: $MODEL_INFO"
fi

# Clean up
echo "🧹 Cleaning up..."
docker stop urine-analysis-test
docker rm urine-analysis-test
docker rmi urine-analysis-api:test

echo ""
echo "🎉 Local Docker test completed!"
echo "=================================================="
echo "If all tests passed, you can proceed with Azure deployment."