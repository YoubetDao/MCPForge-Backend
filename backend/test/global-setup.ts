import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function globalSetup() {
  console.log('🚀 Setting up test environment...');
  
  try {
    // Check if PostgreSQL is running
    await execAsync('pg_isready -h localhost -p 5432');
    console.log('✅ PostgreSQL is running');
    
    // Create test database if it doesn't exist
    try {
      await execAsync('createdb -h localhost -p 5432 -U postgres mcpforge_test');
      console.log('✅ Test database created');
    } catch (error) {
      // Database might already exist, that's okay
      console.log('ℹ️  Test database already exists or creation failed');
    }
    
    // Create test user if it doesn't exist
    try {
      await execAsync(`psql -h localhost -p 5432 -U postgres -c "CREATE USER mcpforge_test WITH PASSWORD 'test_password';"`);
      await execAsync(`psql -h localhost -p 5432 -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE mcpforge_test TO mcpforge_test;"`);
      console.log('✅ Test user created');
    } catch (error) {
      // User might already exist, that's okay
      console.log('ℹ️  Test user already exists or creation failed');
    }
    
  } catch (error) {
    console.error('❌ Failed to set up test environment:', error);
    process.exit(1);
  }
} 