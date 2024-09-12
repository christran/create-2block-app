import { redirect } from "next/navigation";
import { env } from "@/env";
import { type Metadata } from "next";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Admin Panel",
  description: "Admin Panel",
};

export default async function AdminPage() {
  const { user } = await validateRequest();
  
  if (!user) redirect(Paths.Login);
  if (user?.role !== "admin") redirect(Paths.Dashboard);

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">Admin Panel</h1>
      </div>

    </div>
  );
}
