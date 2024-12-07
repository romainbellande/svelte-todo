import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { board } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const boards = await db.query.board.findMany({
        where: eq(board.userId, locals.user.id),
        with: {
            lists: {
                with: {
                    cards: true
                }
            }
        }
    });

    return {
        boards
    };
};

export const actions: Actions = {
    create: async ({ request, locals }) => {
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

        const newBoard = await db.insert(board).values({
            name,
            userId: locals.user.id
        }).returning();

        return {
            board: newBoard[0]
        };
    }
};
