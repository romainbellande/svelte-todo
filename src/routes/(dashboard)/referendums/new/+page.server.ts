import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { referendumSchema } from './schema';
import type { Actions, PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '@/server/db';
import { referendum } from '@/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login');
	}

	const form = await superValidate(zod(referendumSchema));
	return { form, user: locals.user };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(referendumSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await db.insert(referendum).values({
				...form.data,
				fromDate: new Date(form.data.fromDate),
				toDate: new Date(form.data.toDate),
				createdAt: new Date(),
				updatedAt: new Date()
			});
		} catch (err) {
			console.error('Error creating referendum:', err);
			return fail(500, { form });
		}

		throw redirect(303, '/referendums');
	}
};
