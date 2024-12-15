import { db } from '$lib/server/db';
import {
	referendum,
	referendumVote,
	voteEnum,
	type VoteType
} from '$lib/server/db/schema/referendum';
import { error } from '@sveltejs/kit';
import { eq, gte, lte, or, ilike, SQL, and } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const search = url.searchParams.get('search') || '';
	const status = url.searchParams.get('status') || 'all';
	const now = new Date();

	let where = (): SQL<unknown> | undefined =>
		search
			? or(ilike(referendum.title, `%${search}%`), ilike(referendum.description, `%${search}%`))
			: undefined;

	if (status !== 'all') {
		where = () => {
			if (status === 'active') {
				return and(lte(referendum.fromDate, now), gte(referendum.toDate, now));
			} else if (status === 'upcoming') {
				return gte(referendum.fromDate, now);
			} else if (status === 'ended') {
				return lte(referendum.toDate, now);
			}
			return undefined;
		};
	}

	const query = db.query.referendum.findMany({
		with: {
			createdBy: true,
			votes: true
		},
		where,
		orderBy: (referendum, { desc }) => [desc(referendum.createdAt)]
	});

	const referendums = await query;

	return {
		referendums
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const fromDate = formData.get('fromDate') as string;
		const toDate = formData.get('toDate') as string;
		const createdById = formData.get('createdById') as string;

		if (!title || !description || !fromDate || !toDate || !createdById) {
			throw error(400, 'Missing required fields');
		}

		await db.insert(referendum).values({
			title,
			description,
			fromDate: new Date(fromDate),
			toDate: new Date(toDate),
			createdById
		});
	},

	vote: async ({ request }) => {
		const formData = await request.formData();
		const referendumId = formData.get('referendumId') as string;
		const userId = formData.get('userId') as string;
		const vote = formData.get('vote') as VoteType;

		if (!referendumId || !userId || !vote || !voteEnum.enumValues.includes(vote)) {
			throw error(400, 'Missing required fields or invalid vote type');
		}

		// Check if user has already voted
		const existingVote = await db.query.referendumVote.findFirst({
			where: (vote, { and }) => and(eq(vote.referendumId, referendumId), eq(vote.userId, userId))
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
			userId,
			vote
		});
	}
};
