import { db } from '@/server/db';
import { events } from '@/server/db/schema';
import { error } from '@sveltejs/kit';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const eventsList = await db.query.events.findMany({
		with: {
			createdBy: true
		},
		orderBy: [desc(events.startDate)]
	});

	return {
		events: eventsList
	};
};
