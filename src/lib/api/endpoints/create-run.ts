import { apiClient } from "@/lib/api/clients";
import { z } from "zod";

const createRunResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  message: z.string(),
});

export async function createRun(data: {
  date: Date;
  distance: number;
  duration: number;
  elevationGain?: number;
  notes?: string;
}) {
  return apiClient("/runs", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      duration: data.duration * 60, // Convert minutes to seconds
    }),
    schema: createRunResponseSchema,
  });
}
