const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const setupDatabase = async () => {
  try {
    console.log('Setting up database...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the schema
    await pool.query(schema);
    
    console.log('Database setup completed successfully!');
    console.log('Default admin user created with credentials:');
    console.log('Employee ID: ADMIN001');
    console.log('Password: password');
    
  } catch (error) {
    console.error('Database setup failed:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
