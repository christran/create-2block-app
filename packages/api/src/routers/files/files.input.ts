import { z } from "zod";

export const createFileInput = z.object({
  id: z.string(),
  key: z.string(),
  originalFilename: z.string(),
  contentType: z.string(),
  fileSize: z.number(),
});