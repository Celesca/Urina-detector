#!/bin/bash

# Urine Detector - Docker Startup Script

echo "🧪 Starting Urine Detector Application..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if model file exists
if [ ! -f "./backend/models/40_epochs.pth" ]; then
    echo "⚠️  Model file not found at ./backend/models/40_epochs.pth"
    echo "   Please ensure the model file is in the correct location."
    exit 1
fi

# Create necessary directories
mkdir -p ./backend/models
mkdir -p ./backend/images

echo "📦 Building and starting containers..."

# Start services
if [ "$1" == "dev" ]; then
    echo "🔧 Starting in development mode..."
    docker-compose -f docker-compose.dev.yml up --build -d
    echo "✅ Development services started!"
    echo "   Frontend: http://localhost:5173"
    echo "   Backend:  http://localhost:8000"
else
    echo "🚀 Starting in production mode..."
    docker-compose up --build -d
    echo "✅ Production services started!"
    echo "   Application: http://localhost:3000"
    echo "   Backend API: http://localhost:8000"
    echo "   Full Stack:  http://localhost (with reverse proxy)"
fi

echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "📝 To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop services:"
if [ "$1" == "dev" ]; then
    echo "   docker-compose -f docker-compose.dev.yml down"
else
    echo "   docker-compose down"
fi
