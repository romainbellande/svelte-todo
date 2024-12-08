import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './auth';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const items = pgTable('items', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    reference: text('reference').notNull(),
    assigneeId: uuid('assignee_id').references(() => users.id),
    assignedAt: timestamp('assigned_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertItemSchema = createInsertSchema(items);
export const selectItemSchema = createSelectSchema(items);
