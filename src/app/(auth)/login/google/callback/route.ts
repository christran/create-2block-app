import { cookies } from "next/headers";
import { generateId } from "lucia";
import { OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import { google, lucia } from "@/lib/auth";
import { db } from "@/server/db";
import { Paths } from "@/lib/constants";
import { users } from "@/server/db/schema";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("google_oauth_state")?.value ?? null;
  const storedCodeVerifier = cookies().get("google_code_verifier")?.value ?? null;

  if (!code || !state || !storedState || state !== storedState || !storedCodeVerifier) {
    return new Response(null, {
      status: 400,
      headers: { Location: Paths.Login },
    });
  }

  try {
    const tokens = await google.validateAuthorizationCode(code, storedCodeVerifier);
    const googleUserResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: {
            Authorization: `Bearer ${tokens.accessToken}`
        }
    });

    const googleUser = (await googleUserResponse.json()) as GoogleUser;

    if (!googleUser.email || !googleUser.email_verified) {
      cookies().set('auth_error', 'Please verify your email on Google before continuting', {
        maxAge: 5, // Cookie expires after 60 seconds
        path: '/',
      });

      return new Response(null, {
        status: 302,
        headers: { Location: Paths.Login },
      });
    }

    const existingUser = await db.query.users.findFirst({
        where: (table, { eq, or }) =>
          or(eq(table.googleId, googleUser.sub), eq(table.email, googleUser.email)),
      });

    const avatar = googleUser.picture
    ? googleUser.picture
    : null;

    if (!existingUser) {
        const userId = generateId(21);
        await db.insert(users).values({
          id: userId,
          fullname: googleUser.name,
          email: googleUser.email,
          accountPasswordless: true,
          emailVerified: true,
          githubId: googleUser.sub,
          avatar,
        });

        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

        return new Response(null, {
          status: 302,
          headers: { Location: Paths.Dashboard },
        });
      }

    if (existingUser.googleId !== googleUser.sub) {
    await db
        .update(users)
        .set({
        googleId: googleUser.sub,
        // fullname: googleUser.name,
        // emailVerified: true,
        // avatar,
        })
        .where(eq(users.id, existingUser.id));
    }

    const session = await lucia.createSession(existingUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    
      return new Response(null, {
        status: 302,
        headers: { Location: Paths.Dashboard },
      });
  } catch (e) {
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(JSON.stringify({ message: "Invalid code" }), {
        status: 400,
      });
    }
    console.error(e);

    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
    });
  }
}

interface GoogleUser {
  sub: string,
  name: string,
  given_name: string,
  picture: string,
  email: string,
  email_verified: boolean
}