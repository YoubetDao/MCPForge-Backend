export default async function globalTeardown() {
  console.log('🧹 Cleaning up test environment...');
  
  // Note: We don't automatically drop the test database here
  // because it might be useful for debugging failed tests.
  // Use the test script with --cleanup flag to clean up.
  
  console.log('✅ Test environment cleanup completed');
} 