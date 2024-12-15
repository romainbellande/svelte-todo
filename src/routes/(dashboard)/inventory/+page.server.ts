import { db } from '$lib/server/db';
import { item, user } from '$lib/server/db/schema';
import { count, desc, ilike, or, isNull, eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('search')?.toLowerCase() || '';
	const page = parseInt(url.searchParams.get('page') || '1');
	const perPage = parseInt(url.searchParams.get('per_page') || '10');
	const offset = (page - 1) * perPage;

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
				isNull(item.archivedAt)
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
				isNull(item.archivedAt)
			)
		)
		.orderBy(desc(item.updatedAt))
		.limit(perPage)
		.offset(offset);

	const users = await db.query.user.findMany({
		columns: {
			id: true,
			firstname: true,
			lastname: true
		}
	});

	return {
		items: items.map((item) => ({
			...item.item,
			assignee: item.user
				? {
						id: item.user.id,
						firstname: item.user.firstname,
						lastname: item.user.lastname
					}
				: null
		})),
		users: users.map((u) => ({
			id: u.id,
			name: `${u.firstname} ${u.lastname}`
		})),
		pagination: {
			page,
			perPage,
			totalItems
		}
	};
};
