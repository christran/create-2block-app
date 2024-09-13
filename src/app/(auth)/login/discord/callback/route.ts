import { cookies } from "next/headers";
import { generateId } from "lucia";
import { OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import { discord, lucia } from "@/lib/auth";
import { db } from "@/server/db";
import { Paths } from "@/lib/constants";
import { users } from "@/server/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";
import { createContact, sendWelcomeEmail } from "@/lib/auth/actions";

// ... existing DiscordUser interface ...

async function getDiscordUser(code: string): Promise<DiscordUser> {
  const tokens = await discord.validateAuthorizationCode(code);
  const discordUserRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });
  return await discordUserRes.json() as DiscordUser;
}

function redirectWithError(path: string, error: string): Response {
  cookies().set('auth_error', error, { maxAge: 5, path: '/' });
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
    return redirectWithError(Paths.Login, 'Please log in with your existing account and link your Discord account in the security settings.');
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

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
    return redirectWithError(Paths.Login, 'Please log in with your existing account and link your Discord account in the security settings.');
  }

  const userId = generateId(21);
  const avatar = discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.webp`
    : null;

  const newContact = await createContact(discordUser.email, {
    userId: userId,
    fullname: discordUser.username
  });

  await sendWelcomeEmail(discordUser.username, discordUser.email, newContact.contactId);

  await db.insert(users).values({
    id: userId,
    fullname: discordUser.username,
    email: discordUser.email,
    emailVerified: true,
    role: "default",
    contactId: newContact.contactId,
    discordId: discordUser.id,
    avatar,
  });

  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

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
      return redirectWithError(user ? Paths.Security : Paths.Login, 'Please verify your email on Discord before continuing');
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
        ? redirectWithError(Paths.Security, 'Discord account is already linked with another account')
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
