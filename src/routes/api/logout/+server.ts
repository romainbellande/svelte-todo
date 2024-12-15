import { redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

export async function POST(event) {
	auth.deleteSessionTokenCookie(event);

	throw redirect(302, '/login');
}
