import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { user } from '$lib/server/db/schema';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from './schema';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const userData = await db.query.user.findFirst({
			where: eq(user.id, params.id)
		});

		if (!userData) {
			throw error(404, 'User not found');
		}

		const form = await superValidate(userData, zod(userSchema));

		return {
			form
		};
	} catch (err) {
		console.error('Error loading user:', err);
		throw error(500, 'Error loading user');
	}
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const form = await superValidate(request, zod(userSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			await db
				.update(user)
				.set({
					...form.data,
					updatedAt: new Date()
				})
				.where(eq(user.id, params.id));

			} catch (err) {
				console.error('Error updating user:', err);
				return fail(500, { form });
			}

			throw redirect(303, `/users`);
	}
};
