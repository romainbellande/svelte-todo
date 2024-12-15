import { pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { id, createdAt, updatedAt } from './common';
import { list } from './list';
import { user } from './user';

export const card = pgTable('card', {
	id,
	title: text('title').notNull(),
	description: text('description'),
	listId: text('list_id')
		.notNull()
		.references(() => list.id),
	position: text('position').notNull(),
	assigneeId: text('assignee_id').references(() => user.id),
	createdAt,
	updatedAt
});

export const cardRelations = relations(card, ({ one }) => ({
	list: one(list, {
		fields: [card.listId],
		references: [list.id]
	}),
	assignee: one(user, {
		fields: [card.assigneeId],
		references: [user.id]
	})
}));

export type Card = typeof card.$inferSelect;
