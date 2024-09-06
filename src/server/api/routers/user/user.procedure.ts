import { protectedProcedure, createTRPCRouter } from "@/server/api/trpc";
import { emailVerificationCodes, passwordResetTokens, sessions, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

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
          accountPasswordless: true,
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

  removeDiscordAccount: protectedProcedure
    .query(async ({ ctx }) => {
      const [discord] = await ctx.db
      .update(users)
      .set({
        discordId: null,
      })
      .where(eq(users.id, ctx.user.id))
      .returning();
    
    return discord;
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
      const [user] = await ctx.db.delete(users).where(eq(users.id, input.id)).returning();
      
      await ctx.db.delete(sessions).where(eq(sessions.userId, input.id));
      await ctx.db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.userId, input.id));
      await ctx.db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, input.id));

      return user;
    }),
});
