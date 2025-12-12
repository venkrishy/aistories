#!/bin/bash

# Deploy to Cloudflare Pages Script
# This script builds the app, deploys to Cloudflare Pages, and purges cache to prevent stale assets

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Default values
ENVIRONMENT="${1:-staging}"
SKIP_BUILD="${2:-false}"

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo -e "${RED}❌ Error: Environment must be 'staging' or 'production'${NC}"
    echo "Usage: $0 [staging|production] [skip-build]"
    exit 1
fi

# Set project name based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    PROJECT_NAME="linkuplive-production"
    BRANCH="production"
else
    PROJECT_NAME="linkuplive-staging"
    BRANCH="staging"
fi

cd "$ROOT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Deploy to Cloudflare Pages${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Build
if [ "$SKIP_BUILD" != "true" ]; then
    echo -e "${BLUE}Step 1: Building the app...${NC}"
    
    if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
        echo -e "${YELLOW}⚠️  Warning: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set${NC}"
        echo "   Building without Supabase environment variables..."
    fi
    
    BUILD_OUTPUT=$(npm run build 2>&1)
    echo "$BUILD_OUTPUT"
    
    # Extract JS bundle hash from build output (Vite hash can include hyphens)
    JS_BUNDLE=$(echo "$BUILD_OUTPUT" | grep -oE 'dist/assets/index-[A-Za-z0-9-]+\.js' | head -1 | sed 's|dist/assets/||')
    CSS_BUNDLE=$(echo "$BUILD_OUTPUT" | grep -oE 'dist/assets/index-[A-Za-z0-9-]+\.css' | head -1 | sed 's|dist/assets/||')
    
    if [ -z "$JS_BUNDLE" ]; then
        # Fallback: extract from dist/index.html
        if [ -f "dist/index.html" ]; then
            JS_BUNDLE=$(grep -oE 'index-[A-Za-z0-9-]+\.js' dist/index.html | head -1)
            CSS_BUNDLE=$(grep -oE 'index-[A-Za-z0-9-]+\.css' dist/index.html | head -1)
        fi
    fi
    
    if [ -z "$JS_BUNDLE" ]; then
        echo -e "${RED}❌ Error: Could not extract JS bundle name from build output${NC}"
        echo "Please check the build output manually."
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}✅ Build completed!${NC}"
    echo -e "${GREEN}📦 JS Bundle: $JS_BUNDLE${NC}"
    if [ -n "$CSS_BUNDLE" ]; then
        echo -e "${GREEN}📦 CSS Bundle: $CSS_BUNDLE${NC}"
    fi
    echo ""
else
    echo -e "${YELLOW}Skipping build step.${NC}"
    # Try to extract from existing dist/index.html
    if [ -f "dist/index.html" ]; then
        JS_BUNDLE=$(grep -oE 'index-[A-Za-z0-9-]+\.js' dist/index.html 2>/dev/null | head -1 || echo "")
        CSS_BUNDLE=$(grep -oE 'index-[A-Za-z0-9-]+\.css' dist/index.html 2>/dev/null | head -1 || echo "")
    fi
    
    if [ -z "$JS_BUNDLE" ]; then
        echo -e "${RED}❌ Error: No JS bundle found. Please run the build first.${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Using existing bundle: $JS_BUNDLE${NC}"
fi

# Verify files exist
if [ ! -f "dist/index.html" ]; then
    echo -e "${RED}❌ Error: dist/index.html not found${NC}"
    exit 1
fi

if [ ! -f "dist/assets/$JS_BUNDLE" ]; then
    echo -e "${RED}❌ Error: dist/assets/$JS_BUNDLE not found${NC}"
    exit 1
fi

# Step 2: Deploy to Cloudflare Pages
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 2: Deploying to Cloudflare Pages${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo -e "${RED}❌ Error: CLOUDFLARE_API_TOKEN environment variable is required${NC}"
    exit 1
fi

if [ -z "$CLOUDFLARE_ACCOUNT_ID" ]; then
    echo -e "${RED}❌ Error: CLOUDFLARE_ACCOUNT_ID environment variable is required${NC}"
    exit 1
fi

echo "Deploying to project: $PROJECT_NAME (branch: $BRANCH)"
wrangler pages deploy dist \
    --project-name="$PROJECT_NAME" \
    --branch="$BRANCH" \
    --account-id="$CLOUDFLARE_ACCOUNT_ID"

echo ""
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""

# Step 3: Purge Cloudflare Cache
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Step 3: Purging Cloudflare Cache${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
    echo -e "${YELLOW}⚠️  Warning: CLOUDFLARE_ZONE_ID not set, skipping cache purge${NC}"
    echo "   Cache will be purged automatically by Cloudflare Pages, but it may take a few minutes."
else
    echo "Purging cache for zone: $CLOUDFLARE_ZONE_ID"
    
    PURGE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"purge_everything":true}')
    
    # Check if purge was successful
    if echo "$PURGE_RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Cache purged successfully!${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: Cache purge may have failed${NC}"
        echo "   Response: $PURGE_RESPONSE"
    fi
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Deployment script completed!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Deployment Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Project: $PROJECT_NAME"
echo "  Branch: $BRANCH"
echo "  JS Bundle: $JS_BUNDLE"
if [ -n "$CSS_BUNDLE" ]; then
    echo "  CSS Bundle: $CSS_BUNDLE"
fi
echo ""
echo "Next steps:"
echo "1. Wait a few moments for the deployment to propagate"
echo "2. Visit your Cloudflare Pages URL to verify the deployment"
echo "3. Check that the correct bundle is being served"
echo ""