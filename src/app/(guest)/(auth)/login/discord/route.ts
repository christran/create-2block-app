import { generateState } from "arctic";
import { discord } from "@/lib/auth";
import { cookies } from "next/headers";
import { env } from "@/env";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const disconnectDiscord = searchParams.get("disconnect") === "1";

  if (disconnectDiscord) {
    const { user } = await validateRequest();

    if (!user) redirect(Paths.Login);
    
    if (!user.discordId) redirect(Paths.LinkedAccounts);

    const isPasswordLess = await api.user.isPasswordLess.query();
    const connectedAccountsCount = ['googleId', 'discordId', 'githubId'].filter(id => user[id as keyof typeof user]).length;

    // todo: send message for toast.error
    if (!env.MAGIC_LINK_AUTH && isPasswordLess && connectedAccountsCount <= 1) redirect(Paths.LinkedAccounts);

    await api.user.removeSocialAccounts.mutate({ discord: true });
  }

  const state = generateState();
  const url = await discord.createAuthorizationURL(state, {
    scopes: ["identify", "email"],
  });

  cookies().set("discord_oauth_state", state, {
    path: "/",
    secure: env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: "lax",
  });

  return Response.redirect(url);
}
