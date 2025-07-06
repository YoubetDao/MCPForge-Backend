#!/bin/bash

# Quick Test Script
# This script runs a quick test to verify the environment is working

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

main() {
    print_status "Running Quick Environment Test"
    echo "=================================================="
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ]; then
        print_error "Please run this script from the backend directory"
        exit 1
    fi
    
    # Check pnpm
    if command_exists "pnpm"; then
        print_success "pnpm is available: $(pnpm --version)"
    else
        print_error "pnpm is not available. Please install it first."
        exit 1
    fi
    
    # Check Node.js
    if command_exists "node"; then
        print_success "Node.js is available: $(node --version)"
    else
        print_error "Node.js is not available"
        exit 1
    fi
    
    # Check PostgreSQL
    if command_exists "psql"; then
        print_success "PostgreSQL client is available"
        
        # Try to connect to the database
        if pg_isready -h localhost -p 5433 >/dev/null 2>&1; then
            print_success "PostgreSQL server is running on port 5433"
        else
            print_error "PostgreSQL server is not running on port 5433"
            exit 1
        fi
    else
        print_error "PostgreSQL client is not available"
        exit 1
    fi
    
    # Check test.env
    if [ -f "test.env" ]; then
        print_success "test.env file exists"
        
        # Check for required variables
        source test.env
        if [ -n "$GITHUB_CLIENT_ID" ] && [ -n "$GITHUB_CLIENT_SECRET" ]; then
            print_success "GitHub OAuth credentials are configured"
        else
            print_error "GitHub OAuth credentials are missing in test.env"
            exit 1
        fi
    else
        print_error "test.env file not found"
        exit 1
    fi
    
    # Try to install dependencies
    print_status "Testing dependency installation..."
    export NODE_NO_WARNINGS=1
    export NODE_OPTIONS="--no-warnings"
    
    if pnpm install --frozen-lockfile --silent; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
    
    # Try to run a simple test
    print_status "Running a simple test..."
    if pnpm test --testNamePattern="should be defined" --silent >/dev/null 2>&1; then
        print_success "Basic test execution works"
    else
        print_error "Basic test execution failed"
        exit 1
    fi
    
    print_success "All quick tests passed!"
    echo "=================================================="
    print_status "Environment is ready for testing"
    print_status "You can now run: ./scripts/test-github-auth.sh"
}

main "$@" 