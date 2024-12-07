import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { relations } from 'drizzle-orm';

const id = text('id').primaryKey().$defaultFn(createId);

export const user = pgTable('user', {
    id,
    age: integer('age'),
    username: text('username').notNull().unique(),
    passwordHash: text('password_hash').notNull()
});

export const userRelations = relations(user, ({ many }) => ({
    boards: many(board)
}));

export const session = pgTable("session", {
    id,
    userId: text('user_id').notNull().references(() => user.id),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
});

export const board = pgTable('board', {
    id,
    name: text('name').notNull(),
    userId: text('user_id').notNull().references(() => user.id),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

export const boardRelations = relations(board, ({ one, many }) => ({
    user: one(user, {
        fields: [board.userId],
        references: [user.id],
    }),
    lists: many(list)
}));

export const list = pgTable('list', {
    id,
    name: text('name').notNull(),
    boardId: text('board_id').notNull().references(() => board.id),
    order: integer('order').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

export const listRelations = relations(list, ({ one, many }) => ({
    board: one(board, {
        fields: [list.boardId],
        references: [board.id],
    }),
    cards: many(card)
}));

export const card = pgTable('card', {
    id,
    title: text('title').notNull(),
    description: text('description'),
    listId: text('list_id').notNull().references(() => list.id),
    position: text('position').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).defaultNow().notNull()
});

export const cardRelations = relations(card, ({ one }) => ({
    list: one(list, {
        fields: [card.listId],
        references: [list.id],
    })
}));

export type Session = typeof session.$inferSelect;
export type User = typeof user.$inferSelect;
export type Board = typeof board.$inferSelect;
export type List = typeof list.$inferSelect;
export type Card = typeof card.$inferSelect;
