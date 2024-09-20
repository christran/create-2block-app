import { protectedProcedure, createTRPCRouter } from "@/server/api/trpc";
import { createFileInput } from "./files.input";
import { files } from "@/server/db/schema";

export const filesRouter = createTRPCRouter({
  createFile: protectedProcedure
    .input(createFileInput)
    .mutation(async ({ ctx, input }) => {
      const file = await ctx.db.insert(files).values({
        id: input.id,
        key: input.key,
        userId: ctx.user.id,
        originalFilename: input.originalFilename,
        contentType: input.contentType,
        fileSize: input.fileSize,
      }).returning();

      return file;
    }),
});