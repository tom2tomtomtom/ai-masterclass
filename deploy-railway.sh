#!/bin/bash

# Railway Deployment Script
set -e

echo "🚀 Starting Railway deployment..."

# Set project context
railway status

# Deploy services
echo "📦 Deploying PostgreSQL..."
railway add --template postgres

echo "📦 Deploying Redis..."
railway add --template redis

echo "📦 Deploying main application..."
railway up --detach

echo "🎉 Deployment initiated!"
echo "Check logs with: railway logs"
echo "Check status with: railway status"