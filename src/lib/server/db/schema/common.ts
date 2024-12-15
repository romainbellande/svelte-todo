import { text, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const id = text('id').primaryKey().$defaultFn(createId);
export const createdAt = timestamp('created_at', { withTimezone: true, mode: 'date' })
	.defaultNow()
	.notNull();
export const updatedAt = timestamp('updated_at', { withTimezone: true, mode: 'date' })
	.defaultNow()
	.notNull();
