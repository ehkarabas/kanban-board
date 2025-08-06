import { seedDatabase, resetDatabase } from '../lib/db/utils';

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'seed':
      console.log('Seeding database...');
      await seedDatabase();
      break;
    case 'reset':
      console.log('Resetting database...');
      await resetDatabase();
      break;
    default:
      console.log('Usage: npm run setup-db <command>');
      console.log('Commands:');
      console.log('  seed  - Seed the database with initial data');
      console.log('  reset - Reset the database (delete all data)');
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1); // process.exit(1) ile script'in başarısız olduğunu belirtiyoruz
}); 