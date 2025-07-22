const { testConnection } = require('./config/database');

const testDB = async () => {
  console.log('Testing PostgreSQL connection...');
  
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Database connection successful!');
      console.log('✅ PostgreSQL is running and accessible');
      console.log('✅ Ready to run the application');
    } else {
      console.log('❌ Database connection failed');
      console.log('Please check:');
      console.log('1. PostgreSQL is installed and running');
      console.log('2. Database "task_management" exists');
      console.log('3. Credentials in .env file are correct');
    }
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.log('\n🔧 Setup Instructions:');
    console.log('1. Install PostgreSQL: https://www.postgresql.org/download/');
    console.log('2. Create database: CREATE DATABASE task_management;');
    console.log('3. Update .env file with correct credentials');
    console.log('4. Run: npm run setup-db');
  }
  
  process.exit(0);
};

testDB();
