import { z } from 'zod';

export const insertEventSchema = z
	.object({
		title: z
			.string()
			.min(1, 'Title is required')
			.max(100, 'Title must be less than 100 characters'),
		description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
		location: z.string().max(200, 'Location must be less than 200 characters').optional(),
		startDate: z.coerce.date({
			required_error: 'Start date is required',
			invalid_type_error: 'Start date must be a valid date'
		}),
		endDate: z.coerce.date({
			required_error: 'End date is required',
			invalid_type_error: 'End date must be a valid date'
		})
	})
	.refine((data) => data.endDate >= data.startDate, {
		message: 'End date must be after start date',
		path: ['endDate']
	});
