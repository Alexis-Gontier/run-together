import { z } from 'zod';

export const createRunSchema = z.object({
    date: z.date().nullable().refine(val => val !== null, {
        message: "Date is required",
    }),
    distance: z.number().refine(val => val !== undefined, {
        message: "Distance is required",
    }).positive("Distance must be positive"),
    duration: z.number().refine(val => val !== undefined, {
        message: "Duration is required",
    }).positive("Duration must be positive"),
    elevationGain: z.number().nonnegative().default(0),
    notes: z.string().optional(),
});

export type CreateRunType = z.infer<typeof createRunSchema>;