#!/usr/bin/env node

/**
 * Simple script to migrate data from PostgreSQL to MongoDB
 * Run with: node scripts/migrate.js
 */

const fetch = require('node-fetch');

async function main() {
  try {
    console.log('Starting migration from PostgreSQL to MongoDB...');
    
    // Get migration secret from env var or use default
    const migrationSecret = process.env.MIGRATION_SECRET || 'default-migration-secret';
    
    // Make request to the migration endpoint
    const response = await fetch('http://localhost:5000/api/admin/migrate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ migrationSecret }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Migration completed successfully!');
      console.log(data.message);
    } else {
      console.error('❌ Migration failed:');
      console.error(data.message || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Migration request failed:');
    console.error(error.message);
    console.log('Make sure the server is running on http://localhost:5000');
  }
}

main();