import { redirect } from "next/navigation";
import { Signup } from "./signup";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@2block/shared/shared-constants";
import { env } from "@/env";

export const metadata = {
  title: "Sign Up",
  description: "Signup Page",
};

export default async function SignupPage() {
  const { user } = await validateRequest();

  if (user) redirect(Paths.Dashboard);
  if (env.MAGIC_LINK_AUTH) redirect(Paths.Login);

  return <Signup />;
}
