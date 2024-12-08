import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { board, list, card, user } from '$lib/server/db/schema';
import type { Card } from '$lib/server/db/schema';
import { eq, and, asc, max, inArray } from 'drizzle-orm';
import { LexoRank } from 'lexorank';

export const load: PageServerLoad = async ({ locals, params }) => {
    console.log('Loading board page with params:', params);
    console.log('User context:', locals.user);

    if (!locals.user) {
        console.log('No user found in locals');
        throw error(401, 'Unauthorized');
    }

    try {
        console.log('Attempting to fetch board data...');
        // First fetch the board
        const boardData = await db.select().from(board)
            .where(and(
                eq(board.id, params.id),
                eq(board.userId, locals.user.id)
            ))
            .execute();

        if (!boardData || boardData.length === 0) {
            console.log('Board not found');
            throw error(404, 'Board not found');
        }

        const currentBoard = boardData[0];

        // Fetch lists for the board
        const lists = await db.select().from(list)
            .where(eq(list.boardId, currentBoard.id))
            .orderBy(asc(list.order))
            .execute();

        // Fetch cards for all lists
        const cards = lists.length > 0 
            ? await db.select({
                id: card.id,
                title: card.title,
                description: card.description,
                position: card.position,
                listId: card.listId,
                assigneeId: card.assigneeId,
                createdAt: card.createdAt,
                assignee: user
            })
            .from(card)
            .leftJoin(user, eq(card.assigneeId, user.id))
            .where(
                inArray(
                    card.listId,
                    lists.map(l => l.id)
                )
            )
            .orderBy(asc(card.position))
            .execute()
            : [];

        // Get all users that can be assigned
        const users = await db.select({
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname
        })
        .from(user)
        .execute();

        // Structure the data
        const boardWithRelations = {
            ...currentBoard,
            lists: lists.map(l => ({
                ...l,
                cards: cards.filter(c => c.listId === l.id)
            }))
        };

        return {
            board: boardWithRelations,
            users
        };
    } catch (err) {
        console.error('Error in board load function:', err);
        throw err;
    }
};

export const actions: Actions = {
    createList: async ({ request, locals, params }) => {
        if (!locals.user) {
            throw error(401, 'Unauthorized');
        }

        // Verify board exists and belongs to user
        const boardData = await db.select().from(board)
            .where(and(
                eq(board.id, params.id),
                eq(board.userId, locals.user.id)
            ))
            .execute();

        if (!boardData || boardData.length === 0) {
            throw error(404, 'Board not found');
        }

        const formData = await request.formData();
        const name = formData.get('name');

        if (!name || typeof name !== 'string') {
            return fail(400, {
                error: 'Name is required and must be a string'
            });
        }

        // Get the highest order value for existing lists
        const maxOrderResult = await db.select({ maxOrder: max(list.order) })
            .from(list)
            .where(eq(list.boardId, params.id))
            .execute();
        
        const nextOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1;

        const newList = await db.insert(list)
            .values({
                name,
                boardId: params.id,
                order: nextOrder
            })
            .returning()
            .execute();

        return {
            list: newList[0]
        };
    },

    createCard: async ({ request, locals, params }) => {
        if (!locals.user) {
            throw error(401, 'Unauthorized');
        }

        // Verify board exists and belongs to user
        const boardData = await db.select().from(board)
            .where(and(
                eq(board.id, params.id),
                eq(board.userId, locals.user.id)
            ))
            .execute();

        if (!boardData || boardData.length === 0) {
            throw error(404, 'Board not found');
        }

        const formData = await request.formData();
        const title = formData.get('title');
        const listId = formData.get('listId');

        if (!title || typeof title !== 'string') {
            return fail(400, {
                error: 'Title is required and must be a string'
            });
        }

        if (!listId || typeof listId !== 'string') {
            return fail(400, {
                error: 'List ID is required and must be a string'
            });
        }

        // Verify list exists and belongs to this board
        const listData = await db.select().from(list)
            .where(eq(list.id, listId))
            .execute();

        if (!listData || listData.length === 0 || listData[0].boardId !== params.id) {
            throw error(404, 'List not found or does not belong to this board');
        }

        // Get the last card in the list to determine position
        const lastCard = await db.select().from(card)
            .where(eq(card.listId, listId))
            .orderBy(asc(card.position))
            .execute();

        // Generate position using LexoRank
        const position = lastCard && lastCard.length > 0 
            ? LexoRank.parse(lastCard[0].position).genNext().toString()
            : LexoRank.middle().toString();

        const newCard = await db.insert(card)
            .values({
                title,
                listId,
                position
            })
            .returning()
            .execute();

        return {
            card: newCard[0]
        };
    },

    moveCard: async ({ request, locals, params }) => {
        if (!locals.user) {
            throw error(401, 'Unauthorized');
        }

        const boardData = await db.select().from(board)
            .where(and(
                eq(board.id, params.id),
                eq(board.userId, locals.user.id)
            ))
            .execute();

        if (!boardData || boardData.length === 0) {
            throw error(404, 'Board not found');
        }

        const formData = await request.formData();
        const cardId = formData.get('cardId');
        const targetListId = formData.get('targetListId');
        const prevCardId = formData.get('prevCardId');
        const nextCardId = formData.get('nextCardId');

        if (!cardId || typeof cardId !== 'string') {
            return fail(400, { error: 'Card ID is required' });
        }

        if (!targetListId || typeof targetListId !== 'string') {
            return fail(400, { error: 'Target list ID is required' });
        }

        // Get surrounding cards' positions
        const [prevCard, nextCard] = await Promise.all([
            prevCardId ? db.select().from(card)
                .where(eq(card.id, prevCardId as string))
                .execute() : null,
            nextCardId ? db.select().from(card)
                .where(eq(card.id, nextCardId as string))
                .execute() : null
        ]);

        // Calculate new position using LexoRank
        let newPosition: string;
        try {
            if ((!prevCard || prevCard.length === 0) && (!nextCard || nextCard.length === 0)) {
                // If no surrounding cards, use middle rank
                newPosition = LexoRank.middle().toString();
            } else if (!prevCard || prevCard.length === 0) {
                // If at start, generate position before nextCard
                const nextRank = nextCard && nextCard.length > 0 
                    ? LexoRank.parse(nextCard[0].position) 
                    : LexoRank.middle();
                newPosition = nextRank.genPrev().toString();
            } else if (!nextCard || nextCard.length === 0) {
                // If at end, generate position after prevCard
                const prevRank = prevCard && prevCard.length > 0 
                    ? LexoRank.parse(prevCard[0].position) 
                    : LexoRank.middle();
                newPosition = prevRank.genNext().toString();
            } else {
                // Normal case: generate position between prevCard and nextCard
                const prevRank = LexoRank.parse(prevCard[0].position);
                const nextRank = LexoRank.parse(nextCard[0].position);
                newPosition = prevRank.between(nextRank).toString();
            }
        } catch (e) {
            console.error('Error calculating new position:', e);
            // Fallback: Generate a position after the previous card
            if (prevCard && prevCard.length > 0) {
                const prevRank = LexoRank.parse(prevCard[0].position);
                newPosition = prevRank.genNext().toString();
            } else if (nextCard && nextCard.length > 0) {
                const nextRank = LexoRank.parse(nextCard[0].position);
                newPosition = nextRank.genPrev().toString();
            } else {
                newPosition = LexoRank.middle().toString();
            }
        }

        const updatedCard = await db.update(card)
            .set({
                listId: targetListId,
                position: newPosition
            })
            .where(eq(card.id, cardId))
            .returning()
            .execute();

        return {
            card: updatedCard[0]
        };
    },

    updateCard: async ({ request, locals }) => {
        if (!locals.user) {
            throw error(401, 'Unauthorized');
        }

        const formData = await request.formData();
        const cardId = formData.get('cardId')?.toString();
        const title = formData.get('title')?.toString();
        const description = formData.get('description')?.toString();
        const assigneeId = formData.get('assigneeId')?.toString();

        if (!cardId) {
            return fail(400, {
                error: 'Card ID is required'
            });
        }

        // Get the card to verify ownership
        const existingCard = await db.select().from(card)
            .where(eq(card.id, cardId))
            .execute();

        if (!existingCard || existingCard.length === 0) {
            throw error(404, 'Card not found');
        }

        const cardData = existingCard[0];

        // Get the list and board to verify ownership
        const listData = await db.select().from(list)
            .where(eq(list.id, cardData.listId))
            .execute();

        if (!listData || listData.length === 0) {
            throw error(404, 'List not found');
        }

        const boardData = await db.select().from(board)
            .where(eq(board.id, listData[0].boardId))
            .execute();

        if (!boardData || boardData.length === 0 || boardData[0].userId !== locals.user.id) {
            throw error(403, 'Forbidden');
        }

        const updateData: Partial<Card> = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;
        if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;

        const updatedCard = await db.update(card)
            .set(updateData)
            .where(eq(card.id, cardId))
            .returning()
            .execute();

        return {
            card: updatedCard[0]
        };
    },

    updateList: async ({ request, locals }) => {
        if (!locals.user) {
            throw error(401, 'Unauthorized');
        }

        const formData = await request.formData();
        const listId = formData.get('listId')?.toString();
        const name = formData.get('name')?.toString();

        if (!listId || !name) {
            return fail(400, {
                error: 'List ID and name are required'
            });
        }

        // First, get the list to verify ownership
        const existingList = await db.select().from(list)
            .where(eq(list.id, listId))
            .execute();

        if (!existingList || existingList.length === 0) {
            throw error(404, 'List not found');
        }

        const listData = existingList[0];

        // Get the board to verify ownership
        const boardData = await db.select().from(board)
            .where(eq(board.id, listData.boardId))
            .execute();

        if (!boardData || boardData.length === 0 || boardData[0].userId !== locals.user.id) {
            throw error(403, 'Forbidden');
        }

        const updatedList = await db.update(list)
            .set({ name })
            .where(eq(list.id, listId))
            .returning()
            .execute();

        // Return the updated list with its original order
        return {
            list: {
                ...updatedList[0],
                order: existingList[0].order
            }
        };
    }
};
