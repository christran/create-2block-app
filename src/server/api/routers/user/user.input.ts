import { z } from "zod";

export const getUserSchema = z.object({
  id: z.string(),
});
export type getUserInput = z.infer<typeof getUserSchema>;
