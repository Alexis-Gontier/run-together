import { apiClient } from "@/lib/api/clients";
import { z } from "zod";

const updateRunResponseSchema = z.object({
  success: z.boolean(),
  data: z.any(),
  message: z.string(),
});

export async function updateRun(data: {
  id: string;
  date?: Date;
  distance?: number;
  duration?: number;
  elevationGain?: number;
  notes?: string;
}) {
  const { id, ...body } = data;

  return apiClient(`/runs/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...body,
      duration: body.duration ? body.duration * 60 : undefined, // Convert minutes to seconds
    }),
    schema: updateRunResponseSchema,
  });
}
