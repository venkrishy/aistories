#!/bin/bash

# Visual Storytelling UI - Initialization Script
# This script sets up the project for the first time

set -e

echo "🚀 Initializing Visual Storytelling UI project..."

# Check if we're in the right directory
if [ ! -f "init.sh" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Extract Figma codebase if not already extracted
if [ ! -d "src" ]; then
    echo "📦 Extracting Figma codebase..."
    cp -r /tmp/visual-storytelling-ui/* .
    echo "✅ Figma codebase extracted"
else
    echo "✅ Figma codebase already present"
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p public/stories/the-last-time-i-saw-her
mkdir -p src/utils
mkdir -p src/hooks
mkdir -p src/components
mkdir -p docs
mkdir -p .claude

echo "✅ Directory structure created"

# Check if git repo exists
if [ ! -d ".git" ]; then
    echo "🎯 Initializing git repository..."
    git init
    git add .
    git commit -m "chore: initial project setup from Figma"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "✨ Project initialized successfully!"
echo ""
echo "Next steps:"
echo "  1. Add story images to public/stories/the-last-time-i-saw-her/"
echo "  2. Run 'npm run dev' to start development server"
echo "  3. Check features.json for next feature to implement"
echo "  4. Read claude-progress.txt for current session goals"
echo ""
