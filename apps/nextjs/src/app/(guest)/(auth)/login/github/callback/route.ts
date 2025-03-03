import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import { github } from "@2block/auth";
import { generateSessionToken, createSession } from "@2block/auth";
import { setSessionCookie } from "@/lib/auth/session"
import { db } from "@2block/db/client";
import { Paths } from "@2block/shared/shared-constants";
import { users } from "@2block/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";
import { createContact } from "@2block/email/actions";
import { newAccountTasks } from "@/lib/auth/actions";
import { getClientIP } from "@/lib/utils";

interface GitHubUserEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

const getUserGitHubEmail = async (accessToken: string): Promise<GitHubUserEmail | null> => {
  const getEmail = await fetch("https://api.github.com/user/emails", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`
    }
  });

  const emails = await getEmail.json() as GitHubUserEmail[];
  return emails.find(email => email.primary) ?? null;
}

function redirectWithError(path: string, error: string): Response {
  cookies().set("auth_error", error, { maxAge: 5, path: "/" });
  return new Response(null, { status: 302, headers: { Location: path } });
}

async function handleAccountLinking(githubUser: GitHubUser, userId: string): Promise<Response> {
  await db.update(users)
    .set({ githubId: githubUser.id })
    .where(eq(users.id, userId));

  return new Response(null, { status: 302, headers: { Location: Paths.LinkedAccounts } });
}

async function handleLogin(githubUser: GitHubUser, existingUser: { id: string; githubId: string | null, email: string }): Promise<Response> {
  // If the email
  if (existingUser.githubId === null) {
    return redirectWithError(Paths.Login, "Please log in with your existing account and link your GitHub account in the security settings.");
  }

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, existingUser.id);
  setSessionCookie(sessionToken, session.expiresAt);

  await db.update(users).set({ ipAddress: getClientIP() }).where(eq(users.id, existingUser.id));

  return new Response(null, { status: 302, headers: { Location: Paths.Dashboard } });
}

async function createNewUser(githubUser: GitHubUser, githubUserEmail: GitHubUserEmail): Promise<Response> {
  const existingUser = await db.query.users.findFirst({
    where: (table, { eq, or }) =>
      or(
        // eq(table.discordId, discordUser.id),
        eq(table.email, githubUserEmail.email)
      )
  });

  // GitHub account is not linked to any account but the GitHub email already exists in the db
  if (existingUser) {
    return redirectWithError(Paths.Login, "Please log in with your existing account and link your Google account in the security settings.");
  }

  const userId = nanoid();
  const newContact = await createContact(githubUserEmail.email, {
    userId: userId,
    name: githubUser.name
  });

  await newAccountTasks(githubUser.name, githubUserEmail.email, newContact.contactId);

  await db.insert(users).values({
    id: userId,
    name: githubUser.name,
    email: githubUserEmail.email,
    emailVerified: true,
    ipAddress: getClientIP(),
    role: "default",
    contactId: newContact.contactId ?? null,
    githubId: githubUser.id,
    avatar: githubUser.avatar_url,
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
  const storedState = cookies().get("github_oauth_state")?.value ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, { status: 400, headers: { Location: Paths.Login } });
  }

  try {
    const { user } = await validateRequest();
    const tokens = await github.validateAuthorizationCode(code);
    const githubUserResponse = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokens.accessToken}` }
    });
    const githubUser = await githubUserResponse.json() as GitHubUser;
    const githubUserEmail = await getUserGitHubEmail(tokens.accessToken);

    if (!githubUserEmail?.email || !githubUserEmail?.verified) {
      return redirectWithError(user ? Paths.LinkedAccounts : Paths.Login, "Please verify your email on GitHub before continuing");
    }

    const existingUser = await db.query.users.findFirst({
      where: (table, { eq, or }) =>
        or(
          eq(table.githubId, githubUser.id), 
          // eq(table.email, githubUserEmail.email)
        )
    });

    // User is logged in and wants to link account
    if (user) {
      // If githubId exists in db and If userId in the db !== session user id
      return existingUser && existingUser.id !== user.id
        ? redirectWithError(Paths.LinkedAccounts, "GitHub account is already linked with another account")
        : handleAccountLinking(githubUser, user.id);
    } else {
      // User is not logged in handle logiin or sign up
      // If githubId exists in db
      return existingUser
        ? handleLogin(githubUser, { id: existingUser.id, githubId: existingUser.githubId, email: existingUser.email })
        : createNewUser(githubUser, githubUserEmail);
    }
  } catch (e) {
    console.error(e);
    if (e instanceof OAuth2RequestError) {
      return new Response(JSON.stringify({ message: "Invalid code" }), { status: 400 });
    }
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

interface GitHubUser {
	id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}