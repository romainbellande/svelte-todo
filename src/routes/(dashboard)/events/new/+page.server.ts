import { db } from '@/server/db';
import { events } from '@/server/db/schema/event';
import { error, fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';
import { insertEventSchema } from '../schema';
import { zod } from 'sveltekit-superforms/adapters';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;

	if (!user) {
		throw error(401, 'Unauthorized');
	}

	const form = await superValidate(zod(insertEventSchema));

	return {
		form
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			throw error(401, 'Unauthorized');
		}

		const form = await superValidate(request, zod(insertEventSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const event = await db.query.events.findFirst({
			where: (events, { and, eq }) =>
				and(
					eq(events.title, form.data.title),
					eq(events.startDate, form.data.startDate),
					eq(events.endDate, form.data.endDate)
				)
		});

		if (event) {
			return fail(400, {
				form,
				message: 'An event with this title and dates already exists'
			});
		}

		await db.insert(events).values({
			...form.data,
			createdById: user.id
		});

		throw redirect(303, '/events');
	}
};
