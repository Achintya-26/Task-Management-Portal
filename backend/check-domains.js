const { query } = require('./config/database');

const checkDomains = async () => {
  try {
    console.log('Checking existing domains...');
    
    // Check if domains table exists and what data it contains
    const result = await query('SELECT * FROM domains ORDER BY created_at');
    
    console.log('Existing domains:');
    result.rows.forEach(domain => {
      console.log(`- ID: ${domain.id}, Name: ${domain.name}`);
    });
    
    if (result.rows.length === 0) {
      console.log('No domains found. Let\'s insert the default ones...');
      
      // Insert default domains with proper UUIDs
      const domains = [
        { name: 'Support', description: 'Customer support and help desk activities' },
        { name: 'CR', description: 'Change request and enhancement activities' },
        { name: 'Implementation', description: 'Project implementation and deployment activities' },
        { name: 'QA', description: 'Quality assurance and testing activities' }
      ];
      
      for (const domain of domains) {
        const insertResult = await query(
          'INSERT INTO domains (name, description) VALUES ($1, $2) RETURNING *',
          [domain.name, domain.description]
        );
        console.log(`✅ Created domain: ${insertResult.rows[0].name} with ID: ${insertResult.rows[0].id}`);
      }
    }
    
  } catch (error) {
    console.error('Error checking domains:', error.message);
  }
  
  process.exit(0);
};

checkDomains();
