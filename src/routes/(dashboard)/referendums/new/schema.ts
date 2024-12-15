import { z } from 'zod';

export const referendumSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
	fromDate: z.string().min(1, 'Start date is required'),
	toDate: z.string().min(1, 'End date is required'),
	createdById: z.string().min(1, 'Creator ID is required')
});
