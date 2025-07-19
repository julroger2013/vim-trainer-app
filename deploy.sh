#!/bin/bash

echo "🚀 Vim Trainer Deployment Script"
echo "================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Stop existing container if running
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Build and start the application
echo "🔨 Building and starting the application..."
docker-compose up -d --build

# Wait a moment for the container to start
sleep 5

# Check if container is running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Vim Trainer is running successfully!"
    echo ""
    echo "🌐 Access the application at:"
    echo "   http://localhost:3000"
    echo "   http://$(hostname -I | awk '{print $1}'):3000"
    echo ""
    echo "📊 Container status:"
    docker-compose ps
    echo ""
    echo "📝 To view logs: docker-compose logs -f vim-trainer"
    echo "🛑 To stop: docker-compose down"
else
    echo "❌ Failed to start the application. Check the logs:"
    docker-compose logs
fi
