import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { board, list, card } from '$lib/server/db/schema';
import { eq, and, asc, max } from 'drizzle-orm';
import { LexoRank } from 'lexorank';

export const load: PageServerLoad = async ({ locals, params }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const boardData = await db.query.board.findFirst({
        where: and(
            eq(board.id, params.id),
            eq(board.userId, locals.user.id)
        ),
        with: {
            lists: {
                with: {
                    cards: {
                        orderBy: [asc(card.position)]
                    }
                }
            }
        }
    });

    if (!boardData) {
        throw error(404, 'Board not found');
    }

    return {
        board: boardData
    };
};

export const actions: Actions = {
    createList: async ({ request, locals, params }) => {
        if (!locals.user) {
            throw error(401, 'Unauthorized');
        }

        // Verify board exists and belongs to user
        const boardData = await db.query.board.findFirst({
            where: and(
                eq(board.id, params.id),
                eq(board.userId, locals.user.id)
            )
        });

        if (!boardData) {
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
        const maxOrderResult = await db
            .select({ maxOrder: max(list.order) })
            .from(list)
            .where(eq(list.boardId, params.id));
        
        const nextOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1;

        const newList = await db.insert(list)
            .values({
                name,
                boardId: params.id,
                order: nextOrder
            })
            .returning();

        return {
            list: newList[0]
        };
    },

    createCard: async ({ request, locals, params }) => {
        if (!locals.user) {
            throw error(401, 'Unauthorized');
        }

        // Verify board exists and belongs to user
        const boardData = await db.query.board.findFirst({
            where: and(
                eq(board.id, params.id),
                eq(board.userId, locals.user.id)
            )
        });

        if (!boardData) {
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
        const listData = await db.query.list.findFirst({
            where: eq(list.id, listId)
        });

        if (!listData || listData.boardId !== params.id) {
            throw error(404, 'List not found or does not belong to this board');
        }

        // Get the last card in the list to determine position
        const lastCard = await db.query.card.findFirst({
            where: eq(card.listId, listId),
            orderBy: [asc(card.position)],
        });

        // Generate position using LexoRank
        const position = lastCard?.position 
            ? LexoRank.parse(lastCard.position).genNext().toString()
            : LexoRank.middle().toString();

        const newCard = await db.insert(card)
            .values({
                title,
                listId,
                position
            })
            .returning();

        return {
            card: newCard[0]
        };
    },

    moveCard: async ({ request, locals, params }) => {
        if (!locals.user) {
            throw error(401, 'Unauthorized');
        }

        const boardData = await db.query.board.findFirst({
            where: and(
                eq(board.id, params.id),
                eq(board.userId, locals.user.id)
            )
        });

        if (!boardData) {
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
            prevCardId ? db.query.card.findFirst({
                where: eq(card.id, prevCardId as string)
            }) : null,
            nextCardId ? db.query.card.findFirst({
                where: eq(card.id, nextCardId as string)
            }) : null
        ]);

        // Calculate new position using LexoRank
        let newPosition: string;
        try {
            if (!prevCard && !nextCard) {
                // If no surrounding cards, use middle rank
                newPosition = LexoRank.middle().toString();
            } else if (!prevCard) {
                // If at start, generate position before nextCard
                const nextRank = LexoRank.parse(nextCard!.position);
                newPosition = nextRank.genPrev().toString();
            } else if (!nextCard) {
                // If at end, generate position after prevCard
                const prevRank = LexoRank.parse(prevCard.position);
                newPosition = prevRank.genNext().toString();
            } else {
                // If between two cards, generate position between them
                const prev = LexoRank.parse(prevCard.position);
                const next = LexoRank.parse(nextCard.position);
                
                // Handle case where ranks are the same
                if (prev.toString() === next.toString()) {
                    // Generate a new rank after the previous one
                    newPosition = prev.genNext().toString();
                } else {
                    newPosition = prev.between(next).toString();
                }
            }
        } catch (e) {
            console.error('Error calculating new position:', e);
            // Fallback: Generate a position after the previous card
            if (prevCard) {
                const prevRank = LexoRank.parse(prevCard.position);
                newPosition = prevRank.genNext().toString();
            } else if (nextCard) {
                const nextRank = LexoRank.parse(nextCard!.position);
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
            .returning();

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

        if (!cardId || !title) {
            return fail(400, { message: 'Missing required fields' });
        }

        // Verify card exists and belongs to user's board
        const cardData = await db.query.card.findFirst({
            where: eq(card.id, cardId),
            with: {
                list: {
                    with: {
                        board: true
                    }
                }
            }
        });

        if (!cardData || cardData.list.board.userId !== locals.user.id) {
            throw error(404, 'Card not found');
        }

        await db.update(card)
            .set({ 
                title,
                description: description || null
            })
            .where(eq(card.id, cardId));

        return { success: true };
    }
};
