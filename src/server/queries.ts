import "server-only";
import { api } from "@/trpc/server";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { redirect } from "next/navigation";

export async function getUser() {
  const { user } = await validateRequest();

  if (!user) {
    redirect(Paths.Login);
  }

  const userData = await api.user.getUser.query()

  return userData
}
