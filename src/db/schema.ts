import { pgTable, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
