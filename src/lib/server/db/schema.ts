import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

const id = text('id').primaryKey().$defaultFn(createId);

export const user = pgTable('user', {
    id,
    age: integer('age'),
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash').notNull()
});

export const session = pgTable("session", {
    id,
    userId: text('user_id').notNull().references(() => user.id),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
