import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function globalSetup() {
  console.log('🚀 Setting up test environment...');
  
  try {
    // Check if PostgreSQL is running
    await execAsync('pg_isready -h localhost -p 5433');
    console.log('✅ PostgreSQL is running');
    
    // Check if test database exists
    try {
      await execAsync('psql -h localhost -p 5433 -U postgres -lqt | grep mcpforge_test');
      console.log('ℹ️  Test database already exists');
    } catch (error) {
      // Database doesn't exist, try to create it
      try {
        await execAsync('createdb -h localhost -p 5433 -U postgres mcpforge_test');
        console.log('✅ Test database created');
      } catch (createError) {
        console.log('ℹ️  Test database creation failed or already exists');
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to set up test environment:', error);
    process.exit(1);
  }
} 