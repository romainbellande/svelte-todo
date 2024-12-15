import { db } from '$lib/server/db';
import {
	referendum,
	referendumVote,
	voteEnum,
	type VoteType
} from '$lib/server/db/schema/referendum';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { getUserFromSession } from '@/server/auth';

export const load: PageServerLoad = async ({ locals, params }) => {
	const currentUser = getUserFromSession(locals);

	const referendumData = await db.query.referendum.findFirst({
		where: eq(referendum.id, params.id),
		with: {
			createdBy: true,
			votes: {
				with: {
					user: true
				}
			}
		}
	});

	if (!referendumData) {
		throw error(404, 'Referendum not found');
	}

	return {
		referendum: referendumData,
		user: currentUser
	};
};

export const actions: Actions = {
	vote: async ({ request, locals }) => {
		const currentUser = getUserFromSession(locals);

		const formData = await request.formData();
		const referendumId = formData.get('referendumId') as string;
		const vote = formData.get('vote') as VoteType;

		if (!referendumId || !vote || !voteEnum.enumValues.includes(vote)) {
			throw error(400, 'Missing required fields or invalid vote type');
		}

		// Check if user has already voted
		const existingVote = await db.query.referendumVote.findFirst({
			where: (vote, { and }) =>
				and(eq(vote.referendumId, referendumId), eq(vote.userId, currentUser.id))
		});

		if (existingVote) {
			throw error(400, 'User has already voted');
		}

		// Check if referendum is active
		const ref = await db.query.referendum.findFirst({
			where: eq(referendum.id, referendumId)
		});

		if (!ref) {
			throw error(404, 'Referendum not found');
		}

		const now = new Date();
		if (now < ref.fromDate || now > ref.toDate) {
			throw error(400, 'Referendum is not active');
		}

		await db.insert(referendumVote).values({
			referendumId,
			userId: currentUser.id,
			vote,
			createdAt: new Date(),
			updatedAt: new Date()
		});

		return { success: true };
	}
};
