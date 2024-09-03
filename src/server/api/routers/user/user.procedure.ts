import { protectedProcedure, createTRPCRouter } from "@/server/api/trpc";
import * as inputs from "./user.input";
import * as services from "./user.service";

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
});
