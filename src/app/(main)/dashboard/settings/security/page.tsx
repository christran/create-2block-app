import { validateRequest } from "@/lib/auth/validate-request";
import { LinkedAccounts } from "./_components/linked-accounts";
import { MultiFactorAuth } from "./_components/multifactorauth";
import { UpdatePassword } from "./_components/update-password";
import { notFound, redirect } from "next/navigation";
import { Paths } from "@/lib/constants";
import { api } from "@/trpc/server";

export default async function SecurityPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect(Paths.Login);
  }

  // const userData = await api.user.getUser.query();

  // if (!userData) notFound();

  const isPasswordLess = await api.user.isPasswordLess.query();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Security</h1>
      </div>
      <div className="grid gap-8">
        <LinkedAccounts user={user} />
        <UpdatePassword isPasswordLess={isPasswordLess} />
        <MultiFactorAuth />
      </div>
    </div>
  )
}