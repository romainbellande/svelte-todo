import { pgTable, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { id, createdAt, updatedAt } from './common';
import { user } from './user';

export const voteEnum = pgEnum('vote_type', ['yes', 'no', 'blank']);

export const referendum = pgTable('referendum', {
	id,
	title: text('title').notNull(),
	description: text('description').notNull(),
	fromDate: timestamp('from_date').notNull(),
	toDate: timestamp('to_date').notNull(),
	createdById: text('created_by_id')
		.notNull()
		.references(() => user.id),
	createdAt,
	updatedAt
});

export const referendumVote = pgTable('referendum_vote', {
	id,
	referendumId: text('referendum_id')
		.notNull()
		.references(() => referendum.id),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	vote: voteEnum('vote').notNull(),
	createdAt,
	updatedAt
});

export const referendumRelations = relations(referendum, ({ one, many }) => ({
	createdBy: one(user, {
		fields: [referendum.createdById],
		references: [user.id]
	}),
	votes: many(referendumVote)
}));

export const referendumVoteRelations = relations(referendumVote, ({ one }) => ({
	referendum: one(referendum, {
		fields: [referendumVote.referendumId],
		references: [referendum.id]
	}),
	user: one(user, {
		fields: [referendumVote.userId],
		references: [user.id]
	})
}));

export type Referendum = typeof referendum.$inferSelect;
export type ReferendumVote = typeof referendumVote.$inferSelect;
export type VoteType = (typeof voteEnum.enumValues)[number];
