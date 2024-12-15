import { pgTable, text, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { id, createdAt, updatedAt } from './common';
import { board } from './board';
import { card } from './card';
import { item } from './item';

export const user = pgTable('user', {
	id,
	email: text('email').notNull().unique(),
	firstname: text('firstname').notNull(),
	lastname: text('lastname').notNull(),
	passwordHash: text('password_hash').notNull(),
	disabled: boolean('disabled').notNull().default(false),
	createdAt,
	updatedAt
});

export const userRelations = relations(user, ({ many }) => ({
	boards: many(board),
	assignedCards: many(card),
	assignedItems: many(item)
}));
