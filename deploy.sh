#!/bin/bash

# IT Consultation Platform - Deployment Script
# This script helps deploy the application in different environments

set -e  # Exit on any error

echo "🚀 IT Consultation Platform Deployment Script"
echo "=============================================="

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker first."
        echo "   Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose first."
        echo "   Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    echo "✅ Docker and Docker Compose are installed"
}

# Function to setup environment file
setup_env() {
    if [ ! -f .env ]; then
        echo "📝 Creating .env file from template..."
        cp .env.example .env
        echo "⚠️  Please edit .env file with your Agora.io credentials before running the application"
        echo "   Your current Agora App ID: f3657d780c174dd2a7f9f7394548feee"
    else
        echo "✅ .env file already exists"
    fi
}

# Function to deploy for development
deploy_dev() {
    echo "🔧 Deploying for development..."
    setup_env
    docker-compose down
    docker-compose up --build
}

# Function to deploy for production
deploy_prod() {
    echo "🏭 Deploying for production..."
    setup_env
    docker-compose down
    docker-compose --profile production up --build -d
    echo "✅ Production deployment complete!"
    echo "   Application: http://localhost:5000"
    echo "   Nginx proxy: http://localhost:80"
}

# Function to show status
show_status() {
    echo "📊 Current deployment status:"
    docker-compose ps
}

# Function to show logs
show_logs() {
    echo "📋 Application logs:"
    docker-compose logs -f
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping all services..."
    docker-compose down
    echo "✅ All services stopped"
}

# Function to clean up
cleanup() {
    echo "🧹 Cleaning up Docker resources..."
    docker-compose down -v
    docker system prune -f
    echo "✅ Cleanup complete"
}

# Main menu
case "${1:-menu}" in
    "dev"|"development")
        check_docker
        deploy_dev
        ;;
    "prod"|"production")
        check_docker
        deploy_prod
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "stop")
        stop_services
        ;;
    "clean"|"cleanup")
        cleanup
        ;;
    "menu"|*)
        echo "Usage: $0 [command]"
        echo ""
        echo "Commands:"
        echo "  dev         Deploy for development (interactive)"
        echo "  prod        Deploy for production (background)"
        echo "  status      Show current deployment status"
        echo "  logs        Show application logs"
        echo "  stop        Stop all services"
        echo "  clean       Stop services and clean up Docker resources"
        echo ""
        echo "Examples:"
        echo "  $0 dev      # Start development server"
        echo "  $0 prod     # Deploy to production"
        echo "  $0 logs     # View logs"
        echo "  $0 stop     # Stop everything"
        ;;
esac
