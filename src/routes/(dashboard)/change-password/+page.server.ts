import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema/user';
import { eq } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';
import { redirect } from '@sveltejs/kit';

const schema = z
	.object({
		password: z.string().min(8).max(100),
		confirmPassword: z.string().min(8).max(100)
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	});

export const load = async () => {
	const form = await superValidate(zod(schema));
	return { form };
};

export const actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		// Update user's password and remove mustChangePassword flag
		await db
			.update(user)
			.set({
				passwordHash: await hash(form.data.password)
			})
			.where(eq(user.id, locals.user!.id));

		throw redirect(303, '/');
	}
};
