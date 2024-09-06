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
