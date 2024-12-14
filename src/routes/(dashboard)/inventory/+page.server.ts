import { db } from '$lib/server/db';
import { item, user } from '$lib/server/db/schema';
import { desc, eq, ilike, or } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('search')?.toLowerCase() || '';

	const items = await db
		.select()
		.from(item)
		.leftJoin(user, eq(item.assigneeId, user.id))
		.where(
			search
				? or(
						ilike(item.name, `%${search}%`),
						ilike(item.reference, `%${search}%`),
						ilike(user.firstname, `%${search}%`),
						ilike(user.lastname, `%${search}%`)
					)
				: undefined
		)
		.orderBy(desc(item.createdAt));

	const users = await db.query.user.findMany({
		columns: {
			id: true,
			firstname: true,
			lastname: true
		}
	});

	// Transform the joined result to match the expected format
	const formattedItems = items.map((row) => ({
		...row.item,
		assignee: row.user
	}));

	return {
		items: formattedItems,
		users: users.map((u) => ({
			id: u.id,
			name: `${u.firstname} ${u.lastname}`
		}))
	};
};
