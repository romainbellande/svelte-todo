import { pgTable, text, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { id, createdAt, updatedAt } from './common';
import { board } from './board';
import { card } from './card';

export const list = pgTable('list', {
	id,
	name: text('name').notNull(),
	boardId: text('board_id')
		.notNull()
		.references(() => board.id),
	order: integer('order').notNull(),
	createdAt,
	updatedAt
});

export const listRelations = relations(list, ({ one, many }) => ({
	board: one(board, {
		fields: [list.boardId],
		references: [board.id]
	}),
	cards: many(card)
}));
