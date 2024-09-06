import { generateState } from "arctic";
import { github } from "@/lib/auth";
import { cookies } from "next/headers";
import { env } from "@/env";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { api } from "@/trpc/server";
import { revalidatePath } from "next/cache";

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const disconnectGitHub = searchParams.get("disconnect") === "1";

  if (disconnectGitHub) {
    const { user } = await validateRequest();

    if (!user) redirect(Paths.Login);
    
    if (!user.githubId) redirect(Paths.Security);

    // const isPasswordLess = await api.user.isPasswordLess.query()
    if (await api.user.isPasswordLess.query()) redirect(Paths.Security);

    await api.user.removeSocialAccounts.mutate({ github: true });
  }

	const state = generateState();
	const url = await github.createAuthorizationURL(state, {
		scopes: ["read:user", "user:email"]
	});

	cookies().set("github_oauth_state", state, {
		path: "/",
		secure: env.NODE_ENV === "production",
		httpOnly: true,
		maxAge: 60 * 10,
		sameSite: "lax"
	});

	return Response.redirect(url);
}