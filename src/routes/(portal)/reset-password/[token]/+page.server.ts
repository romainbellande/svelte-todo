import { fail, type Actions } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema/user';
import { and, eq, isNull } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';
import type { PageServerLoad } from '../$types.js';
import { z } from 'zod';
import * as m from '$lib/paraglide/messages';

const schema = z
	.object({
		password: z.string().min(8).max(100),
		confirmPassword: z.string().min(8).max(100),
		success: z.boolean().default(false),
		error: z.string().optional()
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: m.form_error_password_mismatch(),
		path: ['confirmPassword']
	});

export const load: PageServerLoad = async () => {
	const form = await superValidate(zod(schema));
	return { form };
};

export const actions: Actions = {
	reset: async ({ request, params }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		if (!params.token) {
			return message(
				form,
				{
					error: m.reset_password_error_invalid()
				},
				{ status: 400 }
			);
		}

		const existingUser = await db.query.user.findFirst({
			where: and(
				eq(user.resetPasswordToken, params.token),
				isNull(user.resetPasswordTokenExpiresAt)
			)
		});

		if (!existingUser) {
			return message(
				form,
				{
					error: m.reset_password_error_invalid()
				},
				{ status: 400 }
			);
		}

		const now = new Date();
		if (
			existingUser.resetPasswordTokenExpiresAt &&
			existingUser.resetPasswordTokenExpiresAt < now
		) {
			return message(
				form,
				{
					error: m.reset_password_error_expired()
				},
				{ status: 400 }
			);
		}

		const passwordHash = await hash(form.data.password);

		await db
			.update(user)
			.set({
				passwordHash,
				resetPasswordToken: null,
				resetPasswordTokenExpiresAt: null
			})
			.where(eq(user.id, existingUser.id));

		return message(form, { success: true });
	}
};
