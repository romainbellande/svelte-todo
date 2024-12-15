import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { user, session } from '$lib/server/db/schema';
import { superValidate } from 'sveltekit-superforms/server';
import { zod } from 'sveltekit-superforms/adapters';
import { userSchema } from './schema';
import { hash } from '@node-rs/argon2';
import { randomBytes } from 'crypto';
import { sendInvitationEmail } from '$lib/server/email';
import { generateSessionToken } from '@/server/auth';

function generateActivationToken(): string {
	return randomBytes(32).toString('hex');
}

export const load: PageServerLoad = async ({ params }) => {
	try {
		if (params.id === 'new') {
			const form = await superValidate(zod(userSchema));
			return { form };
		}

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
	create: async ({ request }) => {
		const form = await superValidate(request, zod(userSchema));

		if (!form.valid) {
			return fail(400, { form });
		}

		try {
			const temporaryPassword = generateSessionToken().slice(0, 12);
			const passwordHash = await hash(temporaryPassword); // Default password that should be changed on first login
			const activationToken = generateActivationToken();
			const now = new Date();
			const activationTokenExpiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

			const [newUser] = await db
				.insert(user)
				.values({
					...form.data,
					passwordHash,
					disabled: false,
					activationToken,
					activationTokenExpiresAt,
					createdAt: now,
					updatedAt: now
				})
				.returning();

			const { email, firstname, lastname } = newUser;

			await sendInvitationEmail({ email, activationToken, firstname, lastname });
		} catch (err) {
			console.error('Error creating user:', err);
			return fail(500, { form });
		}

		throw redirect(303, `/users`);
	},
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
	},
	delete: async ({ params }) => {
		try {
			// First, delete all sessions for this user
			await db.delete(session).where(eq(session.userId, params.id));

			// Then delete the user
			await db.delete(user).where(eq(user.id, params.id));
		} catch (err) {
			console.error('Error deleting user:', err);
			throw error(500, 'Error deleting user');
		}

		throw redirect(302, '/users');
	}
};
