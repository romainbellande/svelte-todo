import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './user';
import { commonSchema } from './common';

export const events = pgTable('events', {
	...commonSchema,
	title: text('title').notNull(),
	description: text('description'),
	location: text('location'),
	startDate: timestamp('start_date').notNull(),
	endDate: timestamp('end_date').notNull(),
	createdById: text('created_by_id')
		.notNull()
		.references(() => user.id)
});

export const eventsRelations = relations(events, ({ one }) => ({
	createdBy: one(user, {
		fields: [events.createdById],
		references: [user.id]
	})
}));

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
