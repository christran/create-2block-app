import type { TRPCRouterRecord } from "@trpc/server";
import { protectedProcedure } from "../../trpc";
import { emailVerificationCodes, passwordResetTokens, sessions, users } from "@2block/db/schema";
import { eq, sql } from "drizzle-orm";
import { tasks } from "@trigger.dev/sdk/v3"; // TODO: move trigger.dev to it's own package
// import type { accountDeletedTask } from "@2block/api/trigger"; // TODO: move trigger.dev to it's own package
import {
  getUserByEmailInput,
  getUserFilesByFolderInput,
  updateContactIdInput,
  updateAvatarInput,
  removeSocialAccountsInput,
  deleteAccountByUserIdInput
} from "./user.input";

export const userRouter = {
  getUser: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (table, { eq }) => eq(table.id, ctx.user.id),
        columns: {
          id: true,
          fullname: true,
          email: true,
          emailVerified: true,
          role: true,
          contactId: true,
          googleId: true,
          discordId: true,
          githubId: true,
          avatar: true,
          stripeSubscriptionId: true,
          stripePriceId: true,
          stripeCustomerId: true,
          stripeCurrentPeriodEnd: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      
      return user ?? null;
    }),

  getUserByEmail: protectedProcedure
    .input(getUserByEmailInput)
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (table, { eq }) => eq(table.email, input.email),
        columns: {
          id: true,
          fullname: true,
          email: true,
          emailVerified: true,
          role: true,
          contactId: true,
          googleId: true,
          discordId: true,
          githubId: true,
          avatar: true,
          stripeSubscriptionId: true,
          stripePriceId: true,
          stripeCustomerId: true,
          stripeCurrentPeriodEnd: true,
          createdAt: true,
          updatedAt: true,
        },
      });
  
      return user;
    }),

  getUserFiles: protectedProcedure
    .query(({ ctx }) => {
      return ctx.db.query.files.findMany({
        where: (table, { eq, and, like }) => and(
          eq(table.userId, ctx.user.id),
          eq(table.s3Provider, process.env.S3_PROVIDER as "cloudflare" | "backblaze"), // TODO: remove when backblaze is the only provider
          eq(table.uploadCompleted, true),
          like(table.key, sql`'files/%'`)  // This matches strings starting with "files/"
        ),
        orderBy: (table, { desc }) => desc(table.createdAt),
        columns: {
          id: true,
          originalFilename: true,
          contentType: true,
          fileSize: true,
          createdAt: true,
          key: true,  // Included key in the returned columns
        },
      });
    }),

  getUserFilesByFolder: protectedProcedure
    .input(getUserFilesByFolderInput)
    .query(async ({ ctx, input }) => {
      const files = await ctx.db.query.files.findMany({
        where: (table, { eq, and, like }) => and(
          eq(table.userId, ctx.user.id),
          like(table.key, sql`'files/${ctx.user.id}/${input.folder}/%'`)
        ),
        orderBy: (table, { desc }) => desc(table.createdAt),
        columns: {
          id: true,
          originalFilename: true,
          contentType: true,
          fileSize: true,
          createdAt: true,
          key: true,
        },
      });

      return files;
    }),

  isPasswordLess: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (table, { eq }) => eq(table.id, ctx.user.id),
        columns: {
          hashedPassword: true,
        },
      });
    
      return user?.hashedPassword === null;
    }),

  updateContactId: protectedProcedure
    .input(updateContactIdInput)
    .mutation(async ({ ctx, input }) => {
      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          contactId: input.contactId
        })
        .where(eq(users.id, ctx.user.id))
        .returning();

      return updatedUser;
    }),

  updateAvatar: protectedProcedure
    .input(updateAvatarInput)
    .mutation(async ({ ctx, input }) => {
      const [updatedUser] = await ctx.db
        .update(users)
        .set({
          avatar: input.avatar
        })
        .where(eq(users.id, ctx.user.id))
        .returning();

      return updatedUser;
    }),

  removeSocialAccounts: protectedProcedure
    .input(removeSocialAccountsInput)
    .mutation(async ({ ctx, input }) => {
      const updateData: Partial<typeof users.$inferSelect> = {};
      
      if (input.google) updateData.googleId = null;
      if (input.discord) updateData.discordId = null;
      if (input.github) updateData.githubId = null;

      if (Object.keys(updateData).length === 0) {
        throw new Error("At least one social account must be selected for removal");
      }

      const [updatedUser] = await ctx.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, ctx.user.id))
        .returning();

      return updatedUser;
    }),

  deleteAccountByUserId: protectedProcedure
    .input(deleteAccountByUserIdInput)
    .mutation(async ({ ctx, input }) => {
      const userData = await ctx.db.query.users.findFirst({
        where: (table, { eq }) => eq(table.id, ctx.user.id),
        columns: {
          fullname: true,
          email: true,
          contactId: true,
        },
      });
      if (!userData) {
        throw new Error("User data not found");
      }

      // TODO: uncomment when trigger.dev works
      // const handle = await tasks.trigger<typeof accountDeletedTask>("account-deleted", {
      //   fullname: userData.fullname,
      //   email: userData.email,
      //   contactId: userData.contactId
      // },
      // {
      //   delay: "3m"
      // });

      const [user] = await ctx.db.delete(users).where(eq(users.id, input.id)).returning();
      
      await ctx.db.delete(sessions).where(eq(sessions.userId, input.id));
      await ctx.db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, input.id));
      await ctx.db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, input.id));

      return user;
    }),
} satisfies TRPCRouterRecord;
