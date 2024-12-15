import { pgTable, text } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { id, createdAt, updatedAt } from './common';
import { user } from './user';
import { list } from './list';

export const board = pgTable('board', {
	id,
	name: text('name').notNull(),
	createdAt,
	updatedAt
});

export const userBoard = pgTable('user_board', {
	id,
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	boardId: text('board_id')
		.notNull()
		.references(() => board.id),
	createdAt,
	updatedAt
});

export const boardRelations = relations(board, ({ many }) => ({
	users: many(userBoard),
	lists: many(list)
}));

export const userBoardRelations = relations(userBoard, ({ one }) => ({
	user: one(user, {
		fields: [userBoard.userId],
		references: [user.id]
	}),
	board: one(board, {
		fields: [userBoard.boardId],
		references: [board.id]
	})
}));

export type Board = typeof board.$inferSelect;
export type UserBoard = typeof userBoard.$inferSelect;
