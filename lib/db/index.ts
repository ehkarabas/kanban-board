import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const isProduction = process.env.NODE_ENV === 'production';

const client = postgres(connectionString, { 
  prepare: false,
  ssl: isProduction ? 'require' : false
});

export const db = drizzle(client, { schema });
export * from './schema';