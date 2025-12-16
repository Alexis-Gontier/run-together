import { z } from 'zod';

export const bmiCreateSchema = z.object({
    weight: z.number().positive("Le poids doit être positif"),
    height: z.number().positive("La taille doit être positive"),
    date: z.date(),
});

export const bmiDeleteSchema = z.object({
    id: z.string(),
});

export type BmiType = z.infer<typeof bmiCreateSchema>;
export type BmiDeleteType = z.infer<typeof bmiDeleteSchema>;