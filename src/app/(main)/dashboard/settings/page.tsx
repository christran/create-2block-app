import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { env } from "@/env";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { api } from "@/trpc/server";
import { SettingsTab } from "./_components/settings-tab";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Settings",
  description: "Manage your your account",
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
    <>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center">
          <h1 className="text-[28px] leading-[34px] tracking-[-0.416px] text-slate-12 font-bold">Settings</h1>
        </div>
      </div>
      
      <div className="flex flex-col gap-6 mx-auto max-w-5xl px-6">
        <SettingsTab user={user} isPasswordLess={isPasswordLess} magicLinkAuth={env.MAGIC_LINK_AUTH} />
      </div>
    </>
  );
}
