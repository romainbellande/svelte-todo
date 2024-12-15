import { fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { board, userBoard } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getUserFromSession } from '@/server/auth';

export const load: PageServerLoad = async ({ locals }) => {
	const currentUser = getUserFromSession(locals);

	const boards = await db.query.board.findMany({
		with: {
			users: {
				where: eq(userBoard.userId, currentUser.id)
			},
			lists: {
				with: {
					cards: true
				}
			}
		},
		where: (board, { exists }) =>
			exists(db.select().from(userBoard).where(eq(userBoard.boardId, board.id)))
	});

	return {
		boards
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const currentUser = getUserFromSession(locals);

		const formData = await request.formData();
		const name = formData.get('name');

		if (!name || typeof name !== 'string') {
			return fail(400, {
				error: 'Name is required and must be a string'
			});
		}

		const newBoard = await db.transaction(async (tx) => {
			// Create the board
			const [createdBoard] = await tx
				.insert(board)
				.values({
					name
				})
				.returning();

			// Create the user-board relationship
			await tx.insert(userBoard).values({
				userId: currentUser.id,
				boardId: createdBoard.id
			});

			return createdBoard;
		});

		return {
			board: newBoard
		};
	}
};
