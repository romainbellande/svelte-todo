import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { id, createdAt, updatedAt } from './common';
import { user } from './user';

export const item = pgTable('item', {
	id,
	name: text('name').notNull(),
	reference: text('reference').notNull(),
	assigneeId: text('assignee_id').references(() => user.id),
	assignedAt: timestamp('assigned_at', { withTimezone: true, mode: 'date' }),
	billingFileKey: text('billing_file_key'),
	archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
	createdAt,
	updatedAt
});

export const itemRelations = relations(item, ({ one }) => ({
	assignee: one(user, {
		fields: [item.assigneeId],
		references: [user.id]
	})
}));

export type Item = typeof item.$inferSelect;
