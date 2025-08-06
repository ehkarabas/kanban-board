import { db } from './index';
import { columns, tasks } from './schema';

export async function seedDatabase() {
  let seedingSuccessful = false;
  try {
    // Insert columns
    const insertedColumns = await db.insert(columns).values([
      { title: 'Todo', order: 0 },
      { title: 'In Progress', order: 1 },
      { title: 'Done', order: 2 }
    ]).returning()

    console.log('Columns inserted:', insertedColumns)

    // Insert tasks
    const insertedTasks = await db.insert(tasks).values([
      {
        title: 'Design landing page',
        description: 'Create wireframes and mockups for the new landing page',
        columnId: insertedColumns[0].id,
        order: 0,
        priority: 'high',
        status: 'todo',
        assigneeId: '1'
      },
      {
        title: 'Set up authentication',
        description: 'Implement user login and registration',
        columnId: insertedColumns[0].id,
        order: 1,
        priority: 'medium',
        status: 'todo',
        assigneeId: '2'
      },
      {
        title: 'Database migration',
        description: 'Update user table schema',
        columnId: insertedColumns[1].id,
        order: 0,
        priority: 'low',
        status: 'in_progress',
        assigneeId: '3'
      },
      {
        title: 'Deploy to production',
        description: 'Set up CI/CD pipeline',
        columnId: insertedColumns[2].id,
        order: 0,
        priority: 'high',
        status: 'done',
        assigneeId: '4'
      },
      {
        title: 'Review code quality',
        description: 'Audit codebase for performance improvements',
        columnId: insertedColumns[0].id,
        order: 2,
        priority: 'medium',
        status: 'todo'
      }
    ]).returning()

    console.log('Tasks inserted:', insertedTasks)
    console.log('Database seeded successfully!')

    seedingSuccessful = true;

  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    // Connection'ı kapat ve process'i sonlandır
    if (seedingSuccessful) {
      console.log('\n Exiting...');
    }
    
    // Process'i sonlandır
    process.exit(seedingSuccessful ? 0 : 1);
  }
}

export async function resetDatabase() {
  let resettingSuccessful = false;
  try {
    await db.delete(tasks);
    await db.delete(columns);
    console.log('Database reset successfully!');
    resettingSuccessful = true;
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  } finally {
    // Connection'ı kapat ve process'i sonlandır
    if (resettingSuccessful) {
      console.log('\n Exiting...');
    }
    
    // Process'i sonlandır
    process.exit(resettingSuccessful ? 0 : 1);
  }
} 