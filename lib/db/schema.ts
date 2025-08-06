import { pgTable, text, timestamp, integer, boolean, uuid } from 'drizzle-orm/pg-core';

export const columns = pgTable('columns', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'), // New description field
  order: integer('order').notNull().default(0),
  deletedAt: timestamp('deleted_at'), // Soft delete timestamp
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  columnId: uuid('column_id').references(() => columns.id, { onDelete: 'cascade' }).notNull(), // will delete assosicated tasks as well
  order: integer('order').notNull().default(0),
  priority: text('priority').default('medium'), // low, medium, high
  status: text('status').default('todo'), // todo, in_progress, done
  assigneeId: text('assignee_id'), // For now, just store the assignee name/id
  dueDate: timestamp('due_date'),
  deletedAt: timestamp('deleted_at'), // Soft delete timestamp
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type Column = typeof columns.$inferSelect;
export type NewColumn = typeof columns.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert; 

// Drizzle ORM'de geçilen string parameter'lar database'deki gerçek column name'lerini belirtir ve bunlar değiştirilebilir.

// Column name'ler sonradan değiştirilebilir, ancak migration gerektirir:
// Eskiden
// createdAt: timestamp('created_at')

// Yeni versiyonda
// createdAt: timestamp('creation_timestamp') 

// Bu durumda migration file'ında column rename işlemi yapılmalıdır