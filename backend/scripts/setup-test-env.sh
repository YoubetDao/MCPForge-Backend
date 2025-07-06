#!/bin/bash

# Setup Test Environment Script
# This script ensures pnpm is available and environment is properly configured

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install pnpm if not available
ensure_pnpm() {
    print_status "Checking pnpm installation..."
    
    if command_exists "pnpm"; then
        print_success "pnpm is already installed: $(pnpm --version)"
        return 0
    fi
    
    print_warning "pnpm not found, attempting to install..."
    
    # Try to install pnpm using npm
    if command_exists "npm"; then
        print_status "Installing pnpm via npm..."
        npm install -g pnpm
        
        if command_exists "pnpm"; then
            print_success "pnpm installed successfully: $(pnpm --version)"
            return 0
        fi
    fi
    
    # Try to install pnpm using curl
    if command_exists "curl"; then
        print_status "Installing pnpm via curl..."
        curl -fsSL https://get.pnpm.io/install.sh | sh -
        
        # Source the shell profile to make pnpm available
        if [ -f "$HOME/.bashrc" ]; then
            source "$HOME/.bashrc"
        elif [ -f "$HOME/.zshrc" ]; then
            source "$HOME/.zshrc"
        fi
        
        # Add pnpm to PATH for current session
        export PATH="$HOME/.local/share/pnpm:$PATH"
        
        if command_exists "pnpm"; then
            print_success "pnpm installed successfully: $(pnpm --version)"
            return 0
        fi
    fi
    
    print_error "Failed to install pnpm. Please install it manually:"
    print_error "npm install -g pnpm"
    print_error "or visit: https://pnpm.io/installation"
    exit 1
}

# Function to clean npm cache and node_modules
clean_npm_artifacts() {
    print_status "Cleaning npm artifacts..."
    
    # Remove node_modules if it exists
    if [ -d "node_modules" ]; then
        print_status "Removing node_modules directory..."
        rm -rf node_modules
        print_success "node_modules removed"
    fi
    
    # Remove package-lock.json if it exists (we're using pnpm)
    if [ -f "package-lock.json" ]; then
        print_status "Removing package-lock.json..."
        rm -f package-lock.json
        print_success "package-lock.json removed"
    fi
    
    # Clean npm cache
    if command_exists "npm"; then
        print_status "Cleaning npm cache..."
        npm cache clean --force 2>/dev/null || true
        print_success "npm cache cleaned"
    fi
}

# Function to setup environment variables
setup_env_vars() {
    print_status "Setting up environment variables..."
    
    # Load test.env if it exists
    if [ -f "test.env" ]; then
        print_status "Loading test.env..."
        export $(cat test.env | grep -v '^#' | xargs)
        print_success "Environment variables loaded"
    else
        print_warning "test.env not found, using defaults"
        
        # Set default environment variables
        export NODE_ENV=test
        export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/mcpforge_test"
        export GITHUB_CLIENT_ID="${GITHUB_CLIENT_ID:-test_client_id}"
        export GITHUB_CLIENT_SECRET="${GITHUB_CLIENT_SECRET:-test_client_secret}"
        export GITHUB_CALLBACK_URL="${GITHUB_CALLBACK_URL:-http://localhost:8443/user/auth/github/callback}"
        export FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
        export PORT="${PORT:-8443}"
    fi
    
    print_success "Environment variables configured"
}

# Function to install dependencies with pnpm
install_deps() {
    print_status "Installing dependencies with pnpm..."
    
    # Set npm config to avoid experimental warnings
    export NODE_NO_WARNINGS=1
    export NODE_OPTIONS="--no-warnings"
    
    if [ -f "pnpm-lock.yaml" ]; then
        pnpm install --frozen-lockfile --silent
    else
        pnpm install --silent
    fi
    
    print_success "Dependencies installed successfully"
}

# Main function
main() {
    print_status "Setting up test environment..."
    echo "=================================================="
    
    # Ensure we're in the backend directory
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Please run this script from the backend directory."
        exit 1
    fi
    
    # Clean npm artifacts first
    clean_npm_artifacts
    
    # Ensure pnpm is available
    ensure_pnpm
    
    # Setup environment variables
    setup_env_vars
    
    # Install dependencies
    install_deps
    
    print_success "Test environment setup completed!"
    echo "=================================================="
    
    # Show environment info
    print_status "Environment Information:"
    echo "  Node.js: $(node --version)"
    echo "  pnpm: $(pnpm --version)"
    echo "  Database: $DATABASE_URL"
    echo "  GitHub Client ID: ${GITHUB_CLIENT_ID:0:8}..."
}

# Run main function
main "$@" 