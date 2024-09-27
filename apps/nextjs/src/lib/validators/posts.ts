import { z } from "zod";

export const myPostsSchema = z.object({
  page: z.number().int().default(1),
  perPage: z.number().int().default(12),
});

export const createPostSchema = z.object({
  title: z.string().min(3).max(255),
  excerpt: z.string().min(3).max(255),
  content: z.string().min(3),
});