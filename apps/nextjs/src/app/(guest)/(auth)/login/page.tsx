import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/get-session";
import { Paths } from "@2block/shared/shared-constants";
import { Login } from "./login";
import { MagicLink } from "./magic-link";
import { env } from "@/env";

export const metadata = {
  title: "Login",
  description: "Login Page",
};

export default async function LoginPage() {
  const { user } = await getSession();

  if (user) redirect(Paths.Dashboard);

  
  return (
    <>
      {env.MAGIC_LINK_AUTH ? <MagicLink /> : <Login />}
    </>
  )
}
