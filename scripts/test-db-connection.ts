import { config } from 'dotenv';
// Load environment variables
config();

import { db } from '../lib/db/index';

async function testConnection() {
  let connectionSuccessful = false;
  
  try {
    console.log('Testing database connection...');
    
    // Try a simple query to test connection
    const result = await db.execute('SELECT NOW() as current_time');
    console.log('✅ Database connection successful!');
    console.log('🕐 Current time from database:', (result[0] as any).current_time);
    
    // Test if tables exist
    const tables = await db.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tables.length > 0) {
      console.log('📋 Available tables:');
      tables.forEach((table: any, index) => {
        console.log(`  ${index + 1}. ${table.table_name}`);
      });
    } else {
      console.log('📋 No tables found in public schema (this is normal for a fresh database)');
    }
    
    // Test database info
    const dbInfo = await db.execute(`
      SELECT 
        current_database() as db_name,
        current_user as current_user,
        version() as pg_version
    `);
    
    const info = dbInfo[0] as any; // Type assertion ekledik
    
    console.log('\n📊 Database Info:');
    console.log(`  Database: ${info.db_name}`);
    console.log(`  User: ${info.current_user}`);
    console.log(`  Version: ${info.pg_version.split(' ')[0]} ${info.pg_version.split(' ')[1]}`);
    
    connectionSuccessful = true;
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure Docker is running');
    console.log('2. Start the database: docker-compose up -d');
    console.log('3. Wait for the container to be healthy');
    console.log('4. Check if port 5433 is available');
  } finally {
    // Connection'ı kapat ve process'i sonlandır
    if (connectionSuccessful) {
      console.log('\n🔄 Closing database connection...');
    }
    
    // Process'i sonlandır
    process.exit(connectionSuccessful ? 0 : 1);
  }
}

testConnection();