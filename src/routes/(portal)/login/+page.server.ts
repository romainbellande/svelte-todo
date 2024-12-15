import { verify } from '@node-rs/argon2';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as auth from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import type { Actions, PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import { zod } from 'sveltekit-superforms/adapters';
import * as m from '$lib/paraglide/messages';

const loginSchema = z.object({
	email: z.string().email(m.form_error_email_invalid()),
	password: z.string().min(1, m.form_error_password_required())
});

export const load: PageServerLoad = async (event) => {
	if (event.locals.user) {
		return redirect(302, '/');
	}

	const form = await superValidate(zod(loginSchema));
	return { form };
};

export const actions: Actions = {
	login: async (event) => {
		const form = await superValidate(event.request, zod(loginSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const { email, password } = form.data;
		const results = await db.select().from(table.user).where(eq(table.user.email, email));

		const existingUser = results.at(0);
		if (!existingUser) {
			form.data.password = '';
			return fail(400, {
				form: {
					...form,
					errors: { password: [m.form_error_credentials()] }
				}
			});
		}

		if (!existingUser.activatedAt) {
			form.data.password = '';
			return fail(400, {
				form: {
					...form,
					errors: {
						email: [m.form_error_activation_required()]
					}
				}
			});
		}

		const validPassword = await verify(existingUser.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		if (!validPassword) {
			form.data.password = '';
			return fail(400, {
				form: {
					...form,
					errors: { password: [m.form_error_credentials()] }
				}
			});
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return redirect(302, '/');
	}
};
