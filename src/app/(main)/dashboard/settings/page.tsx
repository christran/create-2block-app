import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { env } from "@/env";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { Settings } from "./_components/settings";
import { AccountDetails } from "./_components/account-details";
import { getUserById } from "@/lib/auth/actions";

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

  const userData = await getUserById(user.id);

  return (
    /* <React.Suspense fallback={<BillingSkeleton />}> */
    <AccountDetails user={userData} />
    /* </React.Suspense> */
  );
}
