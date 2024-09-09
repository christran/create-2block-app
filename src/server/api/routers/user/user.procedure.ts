import { EmailTemplate } from "@/lib/email/plunk";
import { protectedProcedure, createTRPCRouter } from "@/server/api/trpc";
import { emailVerificationCodes, passwordResetTokens, sessions, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { tasks } from "@trigger.dev/sdk/v3";
import type { accountDeletedTask } from "@/trigger/email";

export const userRouter = createTRPCRouter({
  getUser: protectedProcedure
    .query(async ({ ctx }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (table, { eq }) => eq(table.id, ctx.user.id),
        columns: {
          id: true,
          fullname: true,
          email: true,
          emailVerified: true,
          contactId: true,
          googleId: true,
          discordId: true,
          githubId: true,
          avatar: true,
        },
      });
    
      return user;
    }),

    getUserByEmail: protectedProcedure
    .input(z.object({
      email: z.string().min(1)
    }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: (table, { eq }) => eq(table.email, input.email),
        columns: {
          id: true,
          fullname: true,
          email: true,
          emailVerified: true,
          contactId: true,
          googleId: true,
          discordId: true,
          githubId: true,
          avatar: true,
        },
      });
    
      return user;
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
  .input(z.object({
    contactId: z.string().min(1)
  }))
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

  removeSocialAccounts: protectedProcedure
    .input(z.object({
      google: z.boolean().optional(),
      discord: z.boolean().optional(),
      github: z.boolean().optional(),
    }))
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
    .input(z.object({
      id: z.string(),
    }))
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

      const handle = await tasks.trigger<typeof accountDeletedTask>("account-deleted", {
        fullname: userData.fullname,
        email: userData.email,
        contactId: userData.contactId
      },
      {
        delay: "3m"
      });

      const [user] = await ctx.db.delete(users).where(eq(users.id, input.id)).returning();
      
      await ctx.db.delete(sessions).where(eq(sessions.userId, input.id));
      await ctx.db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, input.id));
      await ctx.db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, input.id));

      return user;
    }),
});
