import "server-only";

import { api } from "@/trpc/server";
import { validateRequest } from "@2block/auth";
import { Paths } from "@2block/shared/shared-constants";
import { redirect } from "next/navigation";

export async function getUser() {
  const { user } = await validateRequest();

  if (!user) {
    redirect(Paths.Login);
  }

  const userData = await api.user.getUser()

  return userData
}
