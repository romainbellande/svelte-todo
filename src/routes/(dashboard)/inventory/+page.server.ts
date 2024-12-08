import { db } from '$lib/server/db';
import { item, user } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const items = await db.query.item.findMany({
        with: {
            assignee: true
        },
        orderBy: [desc(item.createdAt)]
    });

    const users = await db.query.user.findMany({
        columns: {
            id: true,
            firstname: true,
            lastname: true,
        }
    });

    return {
        items,
        users: users.map(u => ({
            id: u.id,
            name: `${u.firstname} ${u.lastname}`
        }))
    };
};
