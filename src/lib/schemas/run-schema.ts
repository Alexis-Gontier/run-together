import { z } from 'zod';

export const createRunSchema = z.object({
    date: z.date(),
    distance: z.number().positive("Distance must be positive"),
    duration: z.number().positive("Duration must be positive"),
    elevationGain: z.number().nonnegative().optional(),
    notes: z.string().optional(),
});

export type CreateRunType = z.infer<typeof createRunSchema>;