#!/bin/bash

# PasarAntar BHVR Deployment Script
# This script deploys the application using Docker Compose

set -e

echo "🚀 Starting PasarAntar BHVR deployment..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please copy .env.example to .env.production and configure your production settings."
    exit 1
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose down --remove-orphans

# Build and start containers
echo "🔨 Building and starting containers..."
docker-compose up --build -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Check if containers are running
echo "🔍 Checking container status..."
docker-compose ps

# Show logs
echo "📋 Showing application logs..."
docker-compose logs app

echo "✅ Deployment completed!"
echo "🌐 Your application is now running at: http://localhost:3000"
echo "📊 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down"