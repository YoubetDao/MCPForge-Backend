#!/bin/bash

# GitHub OAuth Integration Test Script
# This script automates the testing of GitHub OAuth integration

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_ENV_FILE="test.env"
DB_NAME="mcpforge_test"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_HOST="localhost"
DB_PORT="5433"

# Function to print colored output
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

# Function to check dependencies
check_dependencies() {
    print_status "Checking dependencies..."
    
    local missing_deps=()
    
    if ! command_exists "node"; then
        missing_deps+=("node")
    fi
    
    if ! command_exists "pnpm"; then
        missing_deps+=("pnpm")
    fi
    
    if ! command_exists "psql"; then
        missing_deps+=("postgresql")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_error "Please install the missing dependencies and try again."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Function to setup test environment
setup_test_env() {
    print_status "Setting up test environment..."
    
    # Check if test.env exists
    if [ ! -f "$TEST_ENV_FILE" ]; then
        print_error "Test environment file '$TEST_ENV_FILE' not found!"
        print_error "Please create the file with your GitHub OAuth credentials:"
        print_error "GITHUB_CLIENT_ID=your_test_github_client_id"
        print_error "GITHUB_CLIENT_SECRET=your_test_github_client_secret"
        exit 1
    fi
    
    # Load test environment variables
    export $(cat $TEST_ENV_FILE | grep -v '^#' | xargs)
    
    # Validate required environment variables
    if [ -z "$GITHUB_CLIENT_ID" ] || [ -z "$GITHUB_CLIENT_SECRET" ]; then
        print_error "Missing required GitHub OAuth credentials in $TEST_ENV_FILE"
        print_error "Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET"
        exit 1
    fi
    
    print_success "Test environment configured"
}

# Function to setup test database
setup_test_database() {
    print_status "Setting up test database..."
    
    # Check if PostgreSQL is running
    if ! pg_isready -h $DB_HOST -p $DB_PORT >/dev/null 2>&1; then
        print_error "PostgreSQL is not running on $DB_HOST:$DB_PORT"
        print_error "Please start PostgreSQL and try again."
        exit 1
    fi
    
    # Drop test database if it exists (clean start)
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        print_status "Dropping existing test database '$DB_NAME'..."
        dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
        print_success "Existing test database dropped"
    fi
    
    # Create fresh test database
    print_status "Creating test database '$DB_NAME'..."
    createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
    print_success "Test database created"
    
    print_success "Test database setup complete"
}

# Function to setup environment and install dependencies
setup_environment() {
    print_status "Setting up test environment..."
    
    # Run the environment setup script
    if [ -f "scripts/setup-test-env.sh" ]; then
        chmod +x scripts/setup-test-env.sh
        ./scripts/setup-test-env.sh
    else
        print_error "Environment setup script not found!"
        exit 1
    fi
    
    print_success "Environment setup completed"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Set database URL for migrations
    export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    
    # Run migrations
    pnpm run migration:run
    
    print_success "Database migrations completed"
}

# Function to run unit tests
run_unit_tests() {
    print_status "Running unit tests..."
    
    # Run Jest unit tests
    pnpm test -- --testPathPattern="src/.*\.spec\.ts$" --verbose
    
    if [ $? -eq 0 ]; then
        print_success "Unit tests passed"
        return 0
    else
        print_error "Unit tests failed"
        return 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    print_status "Running integration tests..."
    
    # Set test environment variables
    export NODE_ENV=test
    export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    
    # Run e2e tests
    pnpm run test:e2e
    
    if [ $? -eq 0 ]; then
        print_success "Integration tests passed"
        return 0
    else
        print_error "Integration tests failed"
        return 1
    fi
}

# Function to run manual API tests
run_manual_api_tests() {
    print_status "Running manual API tests..."
    
    # Start the application in background
    print_status "Starting test server..."
    pnpm run start:dev &
    SERVER_PID=$!
    
    # Wait for server to start
    sleep 10
    
    # Test basic endpoints
    print_status "Testing basic endpoints..."
    
    # Test health check
    if curl -f http://localhost:8443/ >/dev/null 2>&1; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        kill $SERVER_PID
        return 1
    fi
    
    # Test GitHub auth URL generation
    print_status "Testing GitHub auth URL generation..."
    GITHUB_AUTH_URL=$(curl -s -I http://localhost:8443/user/auth/github | grep -i location | cut -d' ' -f2 | tr -d '\r')
    if [[ $GITHUB_AUTH_URL == *"github.com/login/oauth/authorize"* ]]; then
        print_success "GitHub auth URL generation works"
    else
        print_error "GitHub auth URL generation failed"
        kill $SERVER_PID
        return 1
    fi
    
    # Test user creation
    print_status "Testing user creation..."
    USER_RESPONSE=$(curl -s -X POST http://localhost:8443/user \
        -H "Content-Type: application/json" \
        -d '{
            "username": "testuser",
            "email": "test@example.com",
            "role": "user",
            "auth_type": "github",
            "auth_identifier": "12345678"
        }')
    
    if [[ $USER_RESPONSE == *"testuser"* ]]; then
        print_success "User creation works"
    else
        print_error "User creation failed"
        kill $SERVER_PID
        return 1
    fi
    
    # Stop the server
    kill $SERVER_PID
    wait $SERVER_PID 2>/dev/null
    
    print_success "Manual API tests completed"
}

# Function to cleanup test data
cleanup_test_data() {
    print_status "Cleaning up test data..."
    
    # Drop the entire test database
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
        print_status "Dropping test database '$DB_NAME'..."
        dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
        print_success "Test database dropped"
    else
        print_status "Test database '$DB_NAME' not found"
    fi
    
    print_success "Test data cleaned up"
}

# Function to generate test report
generate_test_report() {
    print_status "Generating test report..."
    
    # Create test report
    cat > test-report.md << EOF
# GitHub OAuth Integration Test Report

## Test Environment
- Database: PostgreSQL
- Node.js: $(node --version)
- pnpm: $(pnpm --version)
- Test Date: $(date)

## Test Results
- Unit Tests: $1
- Integration Tests: $2
- Manual API Tests: $3

## GitHub OAuth Configuration
- Client ID: ${GITHUB_CLIENT_ID:0:8}...
- Callback URL: $GITHUB_CALLBACK_URL

## Test Coverage
- User creation with GitHub auth
- GitHub OAuth callback handling
- User lookup by auth method
- Auth method binding
- Error handling

## Recommendations
1. Ensure GitHub OAuth app is properly configured
2. Test with real GitHub OAuth flow in staging environment
3. Monitor error rates and response times
4. Set up continuous integration pipeline

EOF
    
    print_success "Test report generated: test-report.md"
}

# Main execution
main() {
    print_status "Starting GitHub OAuth Integration Tests"
    echo "=================================================="
    
    # Check dependencies
    check_dependencies
    
    # Setup test environment and install dependencies
    setup_environment
    
    # Setup test database
    setup_test_database
    
    # Run migrations
    run_migrations
    
    # Initialize test results
    UNIT_TEST_RESULT="FAILED"
    INTEGRATION_TEST_RESULT="FAILED"
    MANUAL_TEST_RESULT="FAILED"
    
    # Run tests
    if run_unit_tests; then
        UNIT_TEST_RESULT="PASSED"
    fi
    
    if run_integration_tests; then
        INTEGRATION_TEST_RESULT="PASSED"
    fi
    
    if run_manual_api_tests; then
        MANUAL_TEST_RESULT="PASSED"
    fi
    
    # Generate test report
    generate_test_report "$UNIT_TEST_RESULT" "$INTEGRATION_TEST_RESULT" "$MANUAL_TEST_RESULT"
    
    # Print summary
    echo "=================================================="
    print_status "Test Summary:"
    echo "  Unit Tests: $UNIT_TEST_RESULT"
    echo "  Integration Tests: $INTEGRATION_TEST_RESULT"
    echo "  Manual API Tests: $MANUAL_TEST_RESULT"
    
    # Cleanup test database after tests (unless --keep-db is specified)
    if [ "$1" != "--keep-db" ]; then
        cleanup_test_data
    else
        print_warning "Test database '$DB_NAME' kept for debugging"
    fi
    
    # Exit with appropriate code
    if [[ "$UNIT_TEST_RESULT" == "PASSED" && "$INTEGRATION_TEST_RESULT" == "PASSED" && "$MANUAL_TEST_RESULT" == "PASSED" ]]; then
        print_success "All tests passed!"
        exit 0
    else
        print_error "Some tests failed!"
        exit 1
    fi
}

# Handle script arguments
case "$1" in
    --help|-h)
        echo "Usage: $0 [--keep-db] [--help]"
        echo "Options:"
        echo "  --keep-db  Keep test database after tests (for debugging)"
        echo "  --help     Show this help message"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac 