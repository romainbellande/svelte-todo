import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { eq, and, isNull } from 'drizzle-orm';
import { user } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		throw error(400, 'Activation token is required');
	}

	const now = new Date();
	const userData = await db.query.user.findFirst({
		where: and(eq(user.activationToken, token), isNull(user.activatedAt))
	});

	if (!userData) {
		throw error(404, 'Invalid activation token');
	}

	if (userData.activationTokenExpiresAt && userData.activationTokenExpiresAt < now) {
		throw error(400, 'Activation token has expired');
	}

	// Activate the user
	await db
		.update(user)
		.set({
			activatedAt: now,
			activationToken: null,
			activationTokenExpiresAt: null,
			updatedAt: now
		})
		.where(eq(user.id, userData.id));

	throw redirect(303, '/login?activated=true');
};
