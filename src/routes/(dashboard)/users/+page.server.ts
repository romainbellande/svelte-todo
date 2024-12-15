import { error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { count, eq, or, ilike } from 'drizzle-orm';
import { user } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ url }) => {
	const page = Number(url.searchParams.get('page') ?? '1');
	const perPage = 10;
	const search = url.searchParams.get('search') ?? '';

	try {
		const query = db
			.select()
			.from(user)
			.where(
				or(
					search
						? or(
								ilike(user.firstname, `%${search}%`),
								ilike(user.lastname, `%${search}%`),
								ilike(user.email, `%${search}%`)
							)
						: undefined
				)
			);

		const totalUsers = await db.select({ count: count() }).from(user);
		const users = await query
			.limit(perPage)
			.offset((page - 1) * perPage)
			.orderBy(user.createdAt);

		return {
			users,
			totalUsers: Number(totalUsers[0].count),
			pagination: {
				page,
				perPage,
				totalPages: Math.ceil(Number(totalUsers[0].count) / perPage)
			}
		};
	} catch (err) {
		console.error('Error loading users:', err);
		throw error(500, 'Error loading users');
	}
};

export const actions: Actions = {
	delete: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id');

		if (!id) {
			throw error(400, 'User ID is required');
		}

		try {
			await db.delete(user).where(eq(user.id, id.toString()));
			return { success: true };
		} catch (err) {
			console.error('Error deleting user:', err);
			throw error(500, 'Error deleting user');
		}
	}
};
