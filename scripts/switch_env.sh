#!/bin/bash

# Script to switch between localhost and preview environment configurations

set -e

ENV_TYPE=$1

if [ -z "$ENV_TYPE" ]; then
    echo "Usage: ./switch_env.sh [localhost|preview]"
    echo ""
    echo "  localhost - Configure for local development (backend at localhost:8001)"
    echo "  preview   - Configure for Preview/Production (same-domain with ingress routing)"
    exit 1
fi

if [ "$ENV_TYPE" = "localhost" ]; then
    echo "🔧 Configuring for LOCALHOST development..."
    echo "REACT_APP_BACKEND_URL=http://localhost:8001" > /app/frontend/.env
    echo "REACT_APP_BACKEND_URL=http://localhost:8001" > /app/.env
    echo "✅ Frontend configured to use http://localhost:8001"
    
elif [ "$ENV_TYPE" = "preview" ]; then
    echo "🔧 Configuring for PREVIEW/PRODUCTION..."
    echo "REACT_APP_BACKEND_URL=" > /app/frontend/.env
    echo "REACT_APP_BACKEND_URL=" > /app/.env
    echo "✅ Frontend configured to use same-domain (Kubernetes ingress routing)"
    
else
    echo "❌ Invalid environment type: $ENV_TYPE"
    echo "Please use 'localhost' or 'preview'"
    exit 1
fi

echo ""
echo "🔄 Restarting frontend to apply changes..."
sudo supervisorctl restart frontend

echo ""
echo "✅ Environment switched to: $ENV_TYPE"
echo "⏳ Wait 10-15 seconds for frontend to restart completely"
