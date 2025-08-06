import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/kanban';

// pg_hba.conf dosyasının en sonunda host all all all scram-sha-256 satırı var. Bu satır localhost için trust olan kuralları override ediyor.
// pg_hba.conf'u kontrol : docker exec -it kanban-db sh -c "cat /var/lib/postgresql/data/pg_hba.conf"
// SSL'siz connection string:
// const connectionString = 'postgresql://postgres:postgres@127.0.0.1:5433/kanban?sslmode=disable';


console.log('Connection string:', connectionString); // Debug için

// Disable prefetch as it is not compatible with "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });

// Explicit connection options
// const client = postgres({
//     host: '127.0.0.1',
//     port: 5432,
//     database: 'kanban',
//     username: 'postgres',
//     password: 'postgres',
//     prepare: false,
//     ssl: false
//   });

export const db = drizzle(client, { schema });

export * from './schema'; 