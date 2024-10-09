import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { env } from "@/env";
import { getSession } from "@/lib/auth/get-session";
import { Paths } from "@2block/shared/shared-constants";
import { api } from "@/trpc/server";
import { SettingsTab } from "./_components/settings-tab";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Settings",
  description: "Manage your your account",
};

export default async function SettingsPage() {
  const { user } = await getSession();

  if (!user) {
    redirect(Paths.Login);
  }

  const isPasswordLess = await api.user.isPasswordLess();

  return (
    <>
      <div className="mx-auto max-w-5xl px-4 md:px-2 py-8">
        <div className="flex items-center">
          <h1 className="text-[28px] leading-[34px] tracking-[-0.416px] text-slate-12 font-bold">Settings</h1>
        </div>
      </div>
      
      <div className="flex flex-col gap-6 mx-auto max-w-5xl px-4 md:px-2 pb-8">
        <SettingsTab isPasswordLess={isPasswordLess} magicLinkAuth={env.MAGIC_LINK_AUTH} />
      </div>
    </>
  );
}
