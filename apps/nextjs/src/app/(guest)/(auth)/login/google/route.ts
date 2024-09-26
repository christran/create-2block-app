import { generateCodeVerifier, generateState } from "arctic";
import { google } from "@2block/auth";
import { cookies } from "next/headers";
import { env } from "@/env";
import { validateRequest } from "@2block/auth";
import { Paths } from "@2block/shared/shared-constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const disconnectGoogle = searchParams.get("disconnect") === "1";

  if (disconnectGoogle) {
    const { user } = await validateRequest();

    if (!user) redirect(Paths.Login);
    
    if (!user.googleId) redirect(Paths.LinkedAccounts);

    const isPasswordLess = await api.user.isPasswordLess();
    const connectedAccountsCount = ['googleId', 'discordId', 'githubId'].filter(id => user[id as keyof typeof user]).length;

		// todo: send message for toast.error
    if (!env.MAGIC_LINK_AUTH && isPasswordLess && connectedAccountsCount <= 1) redirect(Paths.LinkedAccounts);

    await api.user.removeSocialAccounts({ google: true });
    // revalidatePath(Paths.Security);
    // redirect(Paths.Security);
  }

	const state = generateState();
  const codeVerifier = generateCodeVerifier();
	const url = await google.createAuthorizationURL(state, codeVerifier, {
    scopes: ['profile', 'email']
  });

	cookies().set("google_oauth_state", state, {
		path: "/",
		secure: env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});

	cookies().set("google_code_verifier", codeVerifier, {
		path: "/",
		secure: env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});

	return Response.redirect(url);
}