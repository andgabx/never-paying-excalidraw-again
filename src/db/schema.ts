import { pgTable, text, timestamp, jsonb, AnyPgColumn, primaryKey } from 'drizzle-orm/pg-core';

export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const folders = pgTable('folders', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  parentId: text('parent_id').references((): AnyPgColumn => folders.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  data: jsonb('data').notNull(),
  workspaceId: text('workspace_id').references(() => workspaces.id),
  folderId: text('folder_id').references(() => folders.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tags = pgTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const noteTags = pgTable('note_tags', {
  noteId: text('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  tagId: text('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
}, (t) => [
  primaryKey({ columns: [t.noteId, t.tagId] })
]);
