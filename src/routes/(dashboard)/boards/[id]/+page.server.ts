import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { board, list, card } from '$lib/server/db/schema';
import type { Card } from '$lib/server/db/schema';
import { eq, asc, max } from 'drizzle-orm';
import { LexoRank } from 'lexorank';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		// Fetch the board with its lists, cards, and all user relationships
		const boardData = await db.query.board.findFirst({
			where: eq(board.id, params.id),
			with: {
				lists: {
					orderBy: asc(list.order),
					with: {
						cards: {
							with: {
								assignee: true
							},
							orderBy: asc(card.position)
						}
					}
				},
				users: {
					with: {
						user: {
							columns: {
								id: true,
								email: true,
								firstname: true,
								lastname: true
							}
						}
					}
				}
			}
		});

		if (!boardData) {
			throw error(404, 'Board not found');
		}

		// Check if current user has access to the board
		const currentUserAccess = boardData.users.find((ub) => ub.userId === locals.user?.id);

		if (!currentUserAccess) {
			throw error(403, 'Access denied');
		}

		return {
			board: boardData,
			lists: boardData.lists,
			boardUsers: boardData.users.map((ub) => ({
				...ub.user
			}))
		};
	} catch (err) {
		console.error('Error loading board:', err);
		throw error(500, 'Failed to load board');
	}
};

export const actions: Actions = {
	createList: async ({ request, locals, params }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const name = formData.get('name');

		if (!name || typeof name !== 'string') {
			return fail(400, {
				error: 'Name is required and must be a string'
			});
		}

		// Get the maximum order value
		const maxOrder = await db
			.select({ max: max(list.order) })
			.from(list)
			.where(eq(list.boardId, params.id))
			.execute();

		const newOrder = (maxOrder[0]?.max || 0) + 1;

		const newList = await db
			.insert(list)
			.values({
				name,
				boardId: params.id,
				order: newOrder
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
		const listData = await db.select().from(list).where(eq(list.id, listId)).execute();

		if (!listData || listData.length === 0 || listData[0].boardId !== params.id) {
			throw error(404, 'List not found or does not belong to this board');
		}

		// Get the last card in the list to determine position
		const lastCard = await db
			.select()
			.from(card)
			.where(eq(card.listId, listId))
			.orderBy(asc(card.position))
			.execute();

		// Generate position using LexoRank
		const position =
			lastCard && lastCard.length > 0
				? LexoRank.parse(lastCard[0].position).genNext().toString()
				: LexoRank.middle().toString();

		const newCard = await db
			.insert(card)
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

	moveCard: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
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
			prevCardId
				? db
						.select()
						.from(card)
						.where(eq(card.id, prevCardId as string))
						.execute()
				: null,
			nextCardId
				? db
						.select()
						.from(card)
						.where(eq(card.id, nextCardId as string))
						.execute()
				: null
		]);

		// Calculate new position using LexoRank
		let newPosition: string;
		try {
			if ((!prevCard || prevCard.length === 0) && (!nextCard || nextCard.length === 0)) {
				// If no surrounding cards, use middle rank
				newPosition = LexoRank.middle().toString();
			} else if (!prevCard || prevCard.length === 0) {
				// If at start, generate position before nextCard
				const nextRank =
					nextCard && nextCard.length > 0
						? LexoRank.parse(nextCard[0].position)
						: LexoRank.middle();
				newPosition = nextRank.genPrev().toString();
			} else if (!nextCard || nextCard.length === 0) {
				// If at end, generate position after prevCard
				const prevRank =
					prevCard && prevCard.length > 0
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

		const updatedCard = await db
			.update(card)
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
		const cardId = formData.get('cardId');

		if (!cardId || typeof cardId !== 'string') {
			return fail(400, { error: 'Card ID is required' });
		}

		// Check board access and role for the card's board
		const cardWithBoard = await db.query.card.findFirst({
			where: eq(card.id, cardId),
			with: {
				list: {
					with: {
						board: {
							with: {
								users: true
							}
						}
					}
				}
			}
		});

		if (!cardWithBoard) {
			return fail(404, { error: 'Card not found' });
		}

		const title = formData.get('title')?.toString();
		const description = formData.get('description')?.toString();
		const assigneeId = formData.get('assigneeId')?.toString();

		const updateData: Partial<Card> = {};
		if (title !== undefined) updateData.title = title;
		if (description !== undefined) updateData.description = description;
		if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;

		const updatedCard = await db
			.update(card)
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
		const listId = formData.get('id');

		if (!listId || typeof listId !== 'string') {
			return fail(400, { error: 'List ID is required' });
		}

		// Check board access and role for the list's board
		const listWithBoard = await db.query.list.findFirst({
			where: eq(list.id, listId),
			with: {
				board: {
					with: {
						users: true
					}
				}
			}
		});

		if (!listWithBoard) {
			return fail(404, { error: 'List not found' });
		}

		const name = formData.get('name')?.toString();

		const updatedList = await db
			.update(list)
			.set({ name })
			.where(eq(list.id, listId))
			.returning()
			.execute();

		// Return the updated list with its original order
		return {
			list: {
				...updatedList[0],
				order: listWithBoard.order
			}
		};
	}
};
