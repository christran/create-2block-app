import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import { createSession, discord, generateSessionToken } from "@2block/auth";
import { db } from "@2block/db/client";
import { Paths } from "@2block/shared/shared-constants";
import { users } from "@2block/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";
import { createContact } from "@2block/email/actions";
import { newAccountTasks } from "@/lib/auth/actions";
import { getClientIP } from "@/lib/utils";
import { setSessionCookie } from "@/lib/auth/session";

async function getDiscordUser(code: string): Promise<DiscordUser> {
  const tokens = await discord.validateAuthorizationCode(code);
  const discordUserRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });
  return await discordUserRes.json() as DiscordUser;
}

function redirectWithError(path: string, error: string): Response {
  cookies().set("auth_error", error, { maxAge: 5, path: "/" });
  return new Response(null, { status: 302, headers: { Location: path } });
}

async function handleAccountLinking(discordUser: DiscordUser, userId: string): Promise<Response> {
  await db.update(users)
    .set({ discordId: discordUser.id })
    .where(eq(users.id, userId));

  return new Response(null, { status: 302, headers: { Location: Paths.LinkedAccounts } });
}

async function handleLogin(discordUser: DiscordUser, existingUser: { id: string; discordId: string | null }): Promise<Response> {
  if (existingUser.discordId === null) {
    return redirectWithError(Paths.Login, "Please log in with your existing account and link your Discord account in the security settings.");
  }

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, existingUser.id);
  setSessionCookie(sessionToken, session.expiresAt);

  await db.update(users).set({ ipAddress: getClientIP() }).where(eq(users.id, existingUser.id));

  return new Response(null, { status: 302, headers: { Location: Paths.Dashboard } });
}

async function createNewUser(discordUser: DiscordUser): Promise<Response> {
  const existingUser = await db.query.users.findFirst({
    where: (table, { eq, or }) =>
      or(
        // eq(table.discordId, discordUser.id),
        eq(table.email, discordUser.email)
      )
  });

  if (existingUser) {
    return redirectWithError(Paths.Login, "Please log in with your existing account and link your Discord account in the security settings.");
  }

  const userId = nanoid();
  const avatar = discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.webp`
    : null;

  const newContact = await createContact(discordUser.email, {
    userId: userId,
    name: discordUser.username
  });

  await newAccountTasks(discordUser.username, discordUser.email, newContact.contactId);

  await db.insert(users).values({
    id: userId,
    name: discordUser.username,
    email: discordUser.email,
    emailVerified: true,
    ipAddress: getClientIP(),
    role: "default",
    contactId: newContact.contactId,
    discordId: discordUser.id,
    avatar,
  });

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, userId);
  setSessionCookie(sessionToken, session.expiresAt);

  return new Response(null, { status: 302, headers: { Location: Paths.Dashboard } });
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("discord_oauth_state")?.value ?? null;
  const discordError = url.searchParams.get("error");

  if (!code || !state || !storedState || state !== storedState || discordError) {
    console.log(discordError);

    return new Response(null, { status: 302, headers: { Location: Paths.Login } });
  }

  try {
    const { user } = await validateRequest();
    const discordUser = await getDiscordUser(code);

    if (!discordUser.email || !discordUser.verified) {
      return redirectWithError(user ? Paths.LinkedAccounts : Paths.Login, "Please verify your email on Discord before continuing");
    }

    const existingUser = await db.query.users.findFirst({
      where: (table, { eq, or }) =>
        or(
          eq(table.discordId, discordUser.id),
          // eq(table.email, discordUser.email!)
        )
    });

    if (user) {
      // User is logged in and wants to link account
      return existingUser && existingUser.id !== user.id
        ? redirectWithError(Paths.LinkedAccounts, "Discord account is already linked with another account")
        : handleAccountLinking(discordUser, user.id);
    } else {
      // User is not logged in
      return existingUser
        ? handleLogin(discordUser, { id: existingUser.id, discordId: existingUser.discordId })
        : createNewUser(discordUser);
    }
  } catch (e) {
    console.error(e);
    if (e instanceof OAuth2RequestError) {
      return new Response(JSON.stringify({ message: "Invalid code" }), { status: 400 });
    }
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

interface DiscordUser {
  id: string;
  username: string;
  avatar: string | null;
  banner: string | null;
  global_name: string | null;
  banner_color: string | null;
  mfa_enabled: boolean;
  locale: string;
  email: string;
  verified: boolean;
}
