import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { env } from "@/env";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { AccountDetails } from "./_components/account-details";
import { api } from "@/trpc/server";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Profile",
  description: "Manage your profile details",
};

export default async function SettingsPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect(Paths.Login);
  }

  // const userData = await api.user.getUser.query();

  // if (!userData) notFound();

  const isPasswordLess = await api.user.isPasswordLess.query();

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">Profile</h1>
      </div>
      <AccountDetails user={user} isPasswordLess={isPasswordLess} />
    </div>
  );
}
