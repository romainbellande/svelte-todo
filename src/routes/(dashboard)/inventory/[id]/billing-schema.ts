import { z } from 'zod';

export const billingSchema = z.object({
	billingFile: z.any()
});
