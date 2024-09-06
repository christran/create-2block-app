import { generateCodeVerifier, generateState } from "arctic";
import { google } from "@/lib/auth";
import { cookies } from "next/headers";
import { env } from "@/env";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { revalidatePath } from "next/cache";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const disconnectGoogle = searchParams.get("disconnect") === "1";

  if (disconnectGoogle) {
    const { user } = await validateRequest();

    if (!user) redirect(Paths.Login);
    
    if (!user.googleId) redirect(Paths.Security);

    const isPasswordLess = await api.user.isPasswordLess.query();
    const connectedAccountsCount = ['googleId', 'discordId', 'githubId'].filter(id => user[id as keyof typeof user]).length;

		// todo: send message for toast.error
    if (isPasswordLess && connectedAccountsCount <= 1) redirect(Paths.Security);

    await api.user.removeSocialAccounts.mutate({ google: true });
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