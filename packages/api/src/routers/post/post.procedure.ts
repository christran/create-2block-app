import type { TRPCRouterRecord } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import { z } from "zod";
import { posts } from "@2block/db/schema";
import { generateId } from "lucia";
import { count, eq } from "drizzle-orm";
import { createPostSchema, deletePostSchema, getPostSchema, listPostsSchema, myPostsSchema, updatePostSchema } from "./post.input";

export const postRouter = {
  list: protectedProcedure
    .input(listPostsSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.query.posts.findMany({
        where: (table, { eq }) => eq(table.status, "published"),
        offset: (input.page - 1) * input.perPage,
        limit: input.perPage,
        orderBy: (table, { desc }) => desc(table.createdAt),
        columns: {
          id: true,
          title: true,
          excerpt: true,
          status: true,
          createdAt: true,
        },
        with: { user: { columns: { email: true } } },
      });
    }),

  get: protectedProcedure
    .input(getPostSchema)
    .query(({ ctx, input }) => {
      return ctx.db.query.posts.findFirst({
        where: (table, { eq }) => eq(table.id, input.id),
        with: { user: { columns: { email: true } } },
      });
    }),

  create: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ ctx, input }) => {
      const id = generateId(15);

      await ctx.db.insert(posts).values({
        id,
        userId: ctx.user.id,
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
      });
    
      // revalidatePath(Paths.Dashboard); // Adjust the path as needed

      return { id };
    }),

  update: protectedProcedure
    .input(updatePostSchema)
    .mutation(async ({ ctx, input }) => {
      const [item] = await ctx.db
      .update(posts)
      .set({
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
      })
      .where(eq(posts.id, input.id))
      .returning();
    
    return item;
    }),

  delete: protectedProcedure
    .input(deletePostSchema)
    .mutation(async ({ ctx, input }) => {
      const [item] = await ctx.db.delete(posts).where(eq(posts.id, input.id)).returning();
      return item;
    }),

  myPosts: protectedProcedure
    .input(myPostsSchema)
    .query(({ ctx, input }) => {
      return ctx.db.query.posts.findMany({
        where: (table, { eq }) => eq(table.userId, ctx.user.id),
        offset: (input.page - 1) * input.perPage,
        limit: input.perPage,
        orderBy: (table, { desc }) => desc(table.createdAt),
        columns: {
          id: true,
          title: true,
          excerpt: true,
          status: true,
          createdAt: true,
        },
      });
    }),

  countUserPosts: protectedProcedure
    .query(async ({ ctx }) => {
      const [result] = await ctx.db
        .select({ count: count() })
        .from(posts)
        .where(eq(posts.userId, ctx.user.id));
      
      return result?.count ?? 0;
  }),
} satisfies TRPCRouterRecord;
