import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { id } from './common';
import { user } from './user';

export const session = pgTable('session', {
	id,
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export type Session = typeof session.$inferSelect;
