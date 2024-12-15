import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { eq, and, isNull } from 'drizzle-orm';
import { user } from '$lib/server/db/schema';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { hash } from '@node-rs/argon2';
import { deleteSessionTokenCookie } from '@/server/auth';
import * as m from '$lib/paraglide/messages';

const schema = z
	.object({
		password: z.string().min(8).max(100),
		confirmPassword: z.string().min(8).max(100)
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: m.form_error_password_mismatch(),
		path: ['confirmPassword']
	});

export const load: PageServerLoad = async (event) => {
	deleteSessionTokenCookie(event);
	const { url } = event;
	const token = url.searchParams.get('token');

	if (!token) {
		throw error(400, m.activation_error_invalid());
	}

	const now = new Date();
	const userData = await db.query.user.findFirst({
		where: and(eq(user.activationToken, token), isNull(user.activatedAt))
	});

	if (!userData) {
		throw error(404, m.activation_error_invalid());
	}

	if (userData.activationTokenExpiresAt && userData.activationTokenExpiresAt < now) {
		throw error(400, m.activation_error_expired());
	}

	const form = await superValidate(zod(schema));
	return { form, token };
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const token = url.searchParams.get('token');
		if (!token) {
			throw error(400, m.activation_error_invalid());
		}

		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const userData = await db.query.user.findFirst({
			where: and(eq(user.activationToken, token), isNull(user.activatedAt))
		});

		if (!userData) {
			throw error(404, m.activation_error_invalid());
		}

		const now = new Date();
		if (userData.activationTokenExpiresAt && userData.activationTokenExpiresAt < now) {
			throw error(400, m.activation_error_expired());
		}

		// Update user's password and activate the account
		await db
			.update(user)
			.set({
				passwordHash: await hash(form.data.password),
				activatedAt: now,
				activationToken: null,
				activationTokenExpiresAt: null,
				updatedAt: now
			})
			.where(eq(user.id, userData.id));

		throw redirect(303, '/login?activated=true');
	}
};
