#!/bin/bash

# Azure Docker Deployment Script for Urine Analysis FastAPI Backend
# This script builds a Docker image and deploys it to Azure App Service

set -e  # Exit on any error

# Configuration - Change these values as needed
RESOURCE_GROUP="urine-analysis-rg"
APP_NAME="urine-analysis-api"
ACR_NAME="urineanalysisacr"
LOCATION="southeastasia"  # Change to your preferred region
IMAGE_NAME="urine-analysis-api"
IMAGE_TAG="latest"

echo "🚀 Starting Azure Docker deployment for Urine Analysis API..."
echo "=================================================="

# Check if logged in to Azure
echo "📋 Checking Azure login status..."
az account show --output table
if [ $? -ne 0 ]; then
    echo "❌ Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

# Create resource group
echo "📁 Creating resource group: $RESOURCE_GROUP"
az group create \
    --name $RESOURCE_GROUP \
    --location $LOCATION \
    --output table

# Create Azure Container Registry
echo "🏗️  Creating Azure Container Registry: $ACR_NAME"
az acr create \
    --resource-group $RESOURCE_GROUP \
    --name $ACR_NAME \
    --sku Basic \
    --output table

# Enable admin user for ACR (for simplicity)
echo "🔑 Enabling ACR admin user..."
az acr update \
    --name $ACR_NAME \
    --admin-enabled true \
    --output table

# Get ACR login server and credentials
ACR_LOGIN_SERVER=$(az acr show \
    --name $ACR_NAME \
    --query loginServer \
    --output tsv)

ACR_USERNAME=$(az acr credential show \
    --name $ACR_NAME \
    --query username \
    --output tsv)

ACR_PASSWORD=$(az acr credential show \
    --name $ACR_NAME \
    --query passwords[0].value \
    --output tsv)

echo "🔐 ACR Login Server: $ACR_LOGIN_SERVER"
echo "👤 ACR Username: $ACR_USERNAME"

# Login to ACR
echo "🔓 Logging in to Azure Container Registry..."
docker login $ACR_LOGIN_SERVER \
    --username $ACR_USERNAME \
    --password $ACR_PASSWORD

# Build Docker image
echo "🏗️  Building Docker image..."
docker build -t $IMAGE_NAME:$IMAGE_TAG .

# Tag the image for ACR
FULL_IMAGE_NAME="$ACR_LOGIN_SERVER/$IMAGE_NAME:$IMAGE_TAG"
docker tag $IMAGE_NAME:$IMAGE_TAG $FULL_IMAGE_NAME

# Push image to ACR
echo "📤 Pushing image to Azure Container Registry..."
docker push $FULL_IMAGE_NAME

# Create App Service plan
echo "⚡ Creating App Service plan..."
az appservice plan create \
    --name "${APP_NAME}-plan" \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku B1 \
    --is-linux \
    --output table

# Create web app for containers
echo "🌐 Creating web app for containers: $APP_NAME"
az webapp create \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan "${APP_NAME}-plan" \
    --deployment-container-image-name $FULL_IMAGE_NAME \
    --output table

# Configure app settings
echo "⚙️  Configuring app settings..."
az webapp config appsettings set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
        WEBSITES_PORT=8000 \
        DOCKER_REGISTRY_SERVER_URL="https://$ACR_LOGIN_SERVER" \
        DOCKER_REGISTRY_SERVER_USERNAME=$ACR_USERNAME \
        DOCKER_REGISTRY_SERVER_PASSWORD=$ACR_PASSWORD \
        WEBSITES_ENABLE_APP_SERVICE_STORAGE=false \
        CORS_ORIGINS="https://$APP_NAME.azurewebsites.net,http://localhost:3000,http://localhost:5173"

# Enable CORS
echo "🔓 Configuring CORS..."
az webapp cors add \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --allowed-origins "https://$APP_NAME.azurewebsites.net" "http://localhost:3000" "http://localhost:5173"

# Get the app URL
APP_URL="https://$APP_NAME.azurewebsites.net"
echo ""
echo "🎉 Docker deployment completed!"
echo "=================================================="
echo "🌐 Your API is available at: $APP_URL"
echo "📖 API Documentation: $APP_URL/docs"
echo "🔍 Health Check: $APP_URL/"
echo ""
echo "📋 Useful Azure CLI commands:"
echo "   • Check logs: az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo "   • Restart app: az webapp restart --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo "   • View app: az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo "   • Scale up: az appservice plan update --name ${APP_NAME}-plan --resource-group $RESOURCE_GROUP --sku S1"
echo "   • Update image: az webapp config container set --name $APP_NAME --resource-group $RESOURCE_GROUP --docker-custom-image-name $FULL_IMAGE_NAME"
echo ""
echo "🗂️  Container Registry:"
echo "   • Registry: $ACR_LOGIN_SERVER"
echo "   • Image: $FULL_IMAGE_NAME"
echo ""
echo "⚠️  Note: First deployment might take 5-10 minutes as Azure pulls and starts the container."
echo "   Monitor logs with the command above if you encounter issues."