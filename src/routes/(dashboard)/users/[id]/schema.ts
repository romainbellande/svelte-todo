import { z } from 'zod';

export const userSchema = z.object({
	firstname: z.string().min(1, 'First name is required'),
	lastname: z.string().min(1, 'Last name is required'),
	email: z.string().email('Invalid email address')
});
