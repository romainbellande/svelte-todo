import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';
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
	activatedAt: timestamp('activated_at'),
	activationToken: text('activation_token').unique(),
	activationTokenExpiresAt: timestamp('activation_token_expires_at'),
	resetPasswordToken: text('reset_password_token').unique(),
	resetPasswordTokenExpiresAt: timestamp('reset_password_token_expires_at'),
	createdAt,
	updatedAt
});

export const userRelations = relations(user, ({ many }) => ({
	boards: many(board),
	assignedCards: many(card),
	assignedItems: many(item)
}));

export type User = typeof user.$inferSelect;
