import { pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { id, createdAt, updatedAt } from './common';
import { user } from './user';
import { list } from './list';

export const board = pgTable('board', {
	id,
	name: text('name').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	createdAt,
	updatedAt
});

export const boardRelations = relations(board, ({ one, many }) => ({
	user: one(user, {
		fields: [board.userId],
		references: [user.id]
	}),
	lists: many(list)
}));

export type Board = typeof board.$inferSelect;
