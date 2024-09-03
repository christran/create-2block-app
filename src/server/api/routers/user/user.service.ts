import type { ProtectedTRPCContext } from "@/server/api/trpc";
import type {
  getUserInput,
} from "./user.input";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const getUserById = async (ctx: ProtectedTRPCContext) => {
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
};

export const isAccountPasswordless = async (ctx: ProtectedTRPCContext): Promise<boolean> => {
  const user = await ctx.db.query.users.findFirst({
    where: (table, { eq }) => eq(table.id, ctx.user.id),
    columns: {
      hashedPassword: true,
    },
  });

  return user?.hashedPassword === null;
};