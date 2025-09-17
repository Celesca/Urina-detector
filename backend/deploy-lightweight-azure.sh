#!/bin/bash

# Lightweight Azure Deployment Script for Urine Analysis FastAPI Backend
# This script deploys only essential files to reduce image size

set -e  # Exit on any error

# Configuration
RESOURCE_GROUP="urine-analysis-rg"
APP_NAME="urine-analysis-api"
LOCATION="southeastasia"
RUNTIME="python:3.9"

echo "🚀 Starting lightweight Azure deployment for Urine Analysis API..."
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

# Create App Service plan
echo "⚡ Creating App Service plan..."
az appservice plan create \
    --name "${APP_NAME}-plan" \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku B1 \
    --is-linux \
    --output table

# Create web app
echo "🌐 Creating web app: $APP_NAME"
az webapp create \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan "${APP_NAME}-plan" \
    --runtime $RUNTIME \
    --output table

# Configure app settings
echo "⚙️  Configuring app settings..."
az webapp config appsettings set \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --settings \
        WEBSITES_PORT=8000 \
        CORS_ORIGINS="https://$APP_NAME.azurewebsites.net,http://localhost:3000,http://localhost:5173" \
        SCM_DO_BUILD_DURING_DEPLOYMENT=true \
        ENABLE_ORYX_BUILD=true

# Enable CORS
echo "🔓 Configuring CORS..."
az webapp cors add \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --allowed-origins "https://$APP_NAME.azurewebsites.net" "http://localhost:3000" "http://localhost:5173"

# Set up local Git deployment
echo "🔧 Setting up Git deployment..."
DEPLOYMENT_URL=$(az webapp deployment source config-local-git \
    --name $APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --output tsv)

echo "📋 Git deployment URL: $DEPLOYMENT_URL"

# Create deployment directory with only essential files
echo "📦 Creating lightweight deployment package..."
DEPLOY_DIR="azure-deploy-lightweight"
mkdir -p $DEPLOY_DIR

# Copy only essential files
cp main.py $DEPLOY_DIR/
cp requirements.txt $DEPLOY_DIR/
mkdir -p $DEPLOY_DIR/models
cp models/40_epochs.pth $DEPLOY_DIR/models/ 2>/dev/null || echo "⚠️  Model file not found"

# Create runtime.txt for Python version
echo "python-3.9" > $DEPLOY_DIR/runtime.txt

# Create .gitignore for deployment
cat > $DEPLOY_DIR/.gitignore << EOF
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
pip-log.txt
pip-delete-this-directory.txt
EOF

# Initialize Git in deployment directory
cd $DEPLOY_DIR
git init
git add .
git commit -m "Lightweight deployment for Azure"

# Add Azure remote
git remote add azure $DEPLOYMENT_URL

# Push to Azure
echo "📤 Deploying lightweight package to Azure..."
git push azure master

cd ..

# Clean up
rm -rf $DEPLOY_DIR

# Get the app URL
APP_URL="https://$APP_NAME.azurewebsites.net"
echo ""
echo "🎉 Lightweight deployment completed!"
echo "=================================================="
echo "🌐 Your API is available at: $APP_URL"
echo "📖 API Documentation: $APP_URL/docs"
echo "🔍 Health Check: $APP_URL/"
echo ""
echo "📋 Useful commands:"
echo "   • Check logs: az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo "   • Restart app: az webapp restart --name $APP_NAME --resource-group $RESOURCE_GROUP"
echo "   • Scale up: az appservice plan update --name ${APP_NAME}-plan --resource-group $RESOURCE_GROUP --sku S1"
echo ""
echo "💡 This deployment is much smaller and should upload faster!"