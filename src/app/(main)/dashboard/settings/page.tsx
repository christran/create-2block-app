import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { env } from "@/env";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { AccountDetails } from "./_components/account-details";
import { api } from "@/trpc/server";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Billing",
  description: "Manage your billing and subscription",
};

export default async function SettingsPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect(Paths.Login);
  }

  return (
    /* <React.Suspense fallback={<BillingSkeleton />}> */
    <AccountDetails user={await api.user.getUser.query() ?? notFound()} />
    /* </React.Suspense> */
  );
}
