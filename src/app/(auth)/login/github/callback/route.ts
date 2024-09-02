import { cookies } from "next/headers";
import { generateId } from "lucia";
import { OAuth2RequestError } from "arctic";
import { eq } from "drizzle-orm";
import { github, lucia } from "@/lib/auth";
import { db } from "@/server/db";
import { Paths } from "@/lib/constants";
import { users } from "@/server/db/schema";

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

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies().get("github_oauth_state")?.value ?? null;

  if (!code || !state || !storedState || state !== storedState) {
    return new Response(null, {
      status: 400,
      headers: { Location: Paths.Login },
    });
  }

  try {
    const tokens = await github.validateAuthorizationCode(code);

    const githubUserResponse = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${tokens.accessToken}`
        }
    });

    const githubUser = (await githubUserResponse.json()) as GitHubUser;
    const githubUserEmail = (await getUserGitHubEmail(tokens.accessToken));

    if (!githubUserEmail?.email || !githubUserEmail?.verified) {
      cookies().set('auth_error', 'Please verify your email on GitHub before continuting', {
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
          or(eq(table.githubId, githubUser.id), eq(table.email, githubUserEmail?.email)),
      });

    const avatar = githubUser.avatar_url
    ? githubUser.avatar_url
    : null;

    if (!existingUser) {
        const userId = generateId(21);
        await db.insert(users).values({
          id: userId,
          fullname: githubUser.name,
          email: githubUserEmail.email,
          emailVerified: true,
          githubId: githubUser.id,
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

    if (existingUser.githubId !== githubUser.id) {
    await db
        .update(users)
        .set({
        githubId: githubUser.id,
        // fullname: githubUser.name,
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

interface GitHubUser {
	id: string;
  name: string;
  email: string;
  avatar_url: string | null;
}