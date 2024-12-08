import { z } from 'zod';

export const inventorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    reference: z.string().min(1, 'Reference is required'),
    assigneeId: z.string().nullish()
});
