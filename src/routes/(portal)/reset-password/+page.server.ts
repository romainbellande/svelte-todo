import { fail } from '@sveltejs/kit';
import { message, superValidate } from 'sveltekit-superforms/server';
import { z } from 'zod';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema/user';
import { eq } from 'drizzle-orm';
import { generateSessionToken } from '$lib/server/auth';
import { sendResetPasswordEmail } from '$lib/server/email';
import { zod } from 'sveltekit-superforms/adapters';

const schema = z.object({
	email: z.string().email(),
	success: z.boolean().default(false)
});

export const load = async () => {
	const form = await superValidate(zod(schema));
	return { form };
};

export const actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, zod(schema));

		if (!form.valid) {
			return fail(400, { form });
		}

		const existingUser = await db.query.user.findFirst({
			where: eq(user.email, form.data.email)
		});

		// Always return success to prevent email enumeration
		if (!existingUser) {
			return message(form, { success: true });
		}

		const resetToken = generateSessionToken();
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

		await db
			.update(user)
			.set({
				resetPasswordToken: resetToken,
				resetPasswordTokenExpiresAt: expiresAt
			})
			.where(eq(user.id, existingUser.id));

		await sendResetPasswordEmail(existingUser.email, resetToken);

		return message(form, { success: true });
	}
};
