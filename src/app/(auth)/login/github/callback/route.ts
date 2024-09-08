import { cookies } from "next/headers";
import { generateId } from "lucia";
import { OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import { github, lucia } from "@/lib/auth";
import { db } from "@/server/db";
import { Paths } from "@/lib/constants";
import { users } from "@/server/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";

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
  cookies().set('auth_error', error, { maxAge: 5, path: '/' });
  return new Response(null, { status: 302, headers: { Location: path } });
}

async function handleAccountLinking(githubUser: GitHubUser, userId: string): Promise<Response> {
  await db.update(users)
    .set({ githubId: githubUser.id })
    .where(eq(users.id, userId));

  return new Response(null, { status: 302, headers: { Location: Paths.Security } });
}

async function handleLogin(githubUser: GitHubUser, existingUser: { id: string; githubId: string | null, email: string }): Promise<Response> {
  // If the email
  if (existingUser.githubId === null) {
    return redirectWithError(Paths.Login, `Please log in with your existing account and link your GitHub account in the security settings.`);
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

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
    return redirectWithError(Paths.Login, 'Please log in with your existing account and link your Google account in the security settings.');
  }

  // todo: send welcome email and save contactId
  // const emailData = await sendEmail(email, EmailTemplate.EmailVerification, { fullname, code: verificationCode });

  // console.log(emailData.emails?.[0]);

  const userId = generateId(21);
  await db.insert(users).values({
    id: userId,
    fullname: githubUser.name,
    email: githubUserEmail.email,
    emailVerified: true,
    contactId: null,
    githubId: githubUser.id,
    avatar: githubUser.avatar_url,
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
      return redirectWithError(user ? Paths.Security : Paths.Login, 'Please verify your email on GitHub before continuing');
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
        ? redirectWithError(Paths.Security, 'GitHub account is already linked with another account')
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