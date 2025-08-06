import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config({ path: '.env.production' });

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Connected to Prisma successfully!');
    
    // Test queries
    const columnCount = await prisma.column.count();
    const taskCount = await prisma.task.count();
    
    console.log('📊 Database Statistics:');
    console.log(`  - Columns: ${columnCount}`);
    console.log(`  - Tasks: ${taskCount}`);
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();