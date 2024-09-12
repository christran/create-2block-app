import { cookies } from "next/headers";
import { generateId } from "lucia";
import { OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import { google, lucia } from "@/lib/auth";
import { db } from "@/server/db";
import { Paths } from "@/lib/constants";
import { users } from "@/server/db/schema";
import { validateRequest } from "@/lib/auth/validate-request";
import { createContact, sendWelcomeEmail } from "@/lib/auth/actions";

// ... existing GoogleUser interface ...

async function getGoogleUser(code: string, codeVerifier: string): Promise<GoogleUser> {
  const tokens = await google.validateAuthorizationCode(code, codeVerifier);
  const googleUserRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.accessToken}` },
  });
  return await googleUserRes.json() as GoogleUser;
}

function redirectWithError(path: string, error: string): Response {
  cookies().set('auth_error', error, { maxAge: 5, path: '/' });
  return new Response(null, { status: 302, headers: { Location: path } });
}

async function handleAccountLinking(googleUser: GoogleUser, userId: string): Promise<Response> {
  await db.update(users)
    .set({ googleId: googleUser.sub })
    .where(eq(users.id, userId));

  return new Response(null, { status: 302, headers: { Location: Paths.Security } });
}

async function handleLogin(googleUser: GoogleUser, existingUser: { id: string; googleId: string | null }): Promise<Response> {
  if (existingUser.googleId === null) {
    return redirectWithError(Paths.Login, 'Please log in with your existing account and link your Google account in the security settings.');
  }

  const session = await lucia.createSession(existingUser.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);

  cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  return new Response(null, { status: 302, headers: { Location: Paths.Dashboard } });
}

async function createNewUser(googleUser: GoogleUser): Promise<Response> {
  const existingUser = await db.query.users.findFirst({
    where: (table, { eq, or }) =>
      or(
        // eq(table.discordId, discordUser.id),
        eq(table.email, googleUser.email)
      )
  });

  if (existingUser) {
    return redirectWithError(Paths.Login, 'Please log in with your existing account and link your Google account in the security settings.');
  }

  const userId = generateId(21);
  const newContact = await createContact(googleUser.email, {
    userId: userId,
    fullname: googleUser.name
  });

  await sendWelcomeEmail(googleUser.name, googleUser.email, newContact.contactId);

  await db.insert(users).values({
    id: userId,
    fullname: googleUser.name,
    email: googleUser.email,
    emailVerified: true,
    role: "default",
    contactId: newContact.contactId,
    googleId: googleUser.sub,
    avatar: googleUser.picture,
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
  const storedState = cookies().get("google_oauth_state")?.value ?? null;
  const storedCodeVerifier = cookies().get("google_code_verifier")?.value ?? '';
  const googleError = url.searchParams.get("error");

  if (!code || !state || !storedState || state !== storedState || googleError) {
    console.log(googleError);

    return new Response(null, { status: 302, headers: { Location: Paths.Login } });
  }

  try {
    const { user } = await validateRequest();
    const googleUser = await getGoogleUser(code, storedCodeVerifier);

    if (!googleUser.email || !googleUser.email_verified) {
      return redirectWithError(user ? Paths.Security : Paths.Login, 'Please verify your email on Google before continuing');
    }

    const existingUser = await db.query.users.findFirst({
      where: (table, { eq, or }) => 
        or(
          eq(table.googleId, googleUser.sub), 
          // eq(table.email, googleUser.email)
        )
    });

    if (user) {
      // User is logged in and wants to link account
      return existingUser && existingUser.id !== user.id
        ? redirectWithError(Paths.Security, 'Google account is already linked with another account')
        : handleAccountLinking(googleUser, user.id);
    } else {
      // User is not logged in
      return existingUser
        ? handleLogin(googleUser, { id: existingUser.id, googleId: existingUser.googleId })
        : createNewUser(googleUser);
    }
  } catch (e) {
    console.error(e);
    if (e instanceof OAuth2RequestError) {
      return new Response(JSON.stringify({ message: "Invalid code" }), { status: 400 });
    }
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
}

interface GoogleUser {
  sub: string,
  name: string,
  given_name: string,
  picture: string | null,
  email: string,
  email_verified: boolean
}