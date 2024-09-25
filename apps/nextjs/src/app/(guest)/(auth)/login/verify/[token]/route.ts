import { env } from "@/env";
import { validateMagicLinkToken } from "@/lib/auth/actions";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { user } = await validateRequest();

  if (user) redirect(Paths.Dashboard);
  if (!env.MAGIC_LINK_AUTH) redirect(Paths.Login);


  const { token } = params;

  await validateMagicLinkToken(token);
}
