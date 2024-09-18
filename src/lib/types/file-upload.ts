import { z } from "zod";

export interface UploadedFile {
  id: string,
  url: string,
  originalFilename: string,
  contentType: string,
  fileSize: number
  createdAt: Date
}

export const fileUploadSchema = z.object({
  files: z.array(z.instanceof(File)),
});

export type FileUploadSchema = z.infer<typeof fileUploadSchema>;