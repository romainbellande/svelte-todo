import { db } from '$lib/server/db';
import { item, user } from '$lib/server/db/schema';
import { count, desc, ilike, or, isNotNull, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('search') ?? undefined;

	const countQuery = await db
		.select({ count: count() })
		.from(item)
		.leftJoin(user, eq(item.assigneeId, user.id))
		.where(
			or(
				search
					? or(
							ilike(item.name, `%${search}%`),
							ilike(item.reference, `%${search}%`),
							ilike(user.firstname, `%${search}%`),
							ilike(user.lastname, `%${search}%`)
						)
					: undefined,
				isNotNull(item.archivedAt)
			)
		);

	const totalItems = Number(countQuery[0].count);

	const items = await db
		.select()
		.from(item)
		.leftJoin(user, eq(item.assigneeId, user.id))
		.where(
			or(
				search
					? or(
							ilike(item.name, `%${search}%`),
							ilike(item.reference, `%${search}%`),
							ilike(user.firstname, `%${search}%`),
							ilike(user.lastname, `%${search}%`)
						)
					: undefined,
				isNotNull(item.archivedAt)
			)
		)
		.orderBy(desc(item.updatedAt))
		.limit(10);

	return {
		items,
		totalItems
	};
};
