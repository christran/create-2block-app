import { validateRequest } from "@/lib/auth/validate-request";
import { LinkedAccounts } from "./_components/linked-accounts";
import { MultiFactorAuth } from "./_components/multifactorauth";
import { UpdatePassword } from "./_components/update-password";
import { redirect } from "next/navigation";
import { Paths } from "@/lib/constants";
import { getUserById } from "@/lib/auth/actions";

export default async function SecurityPage() {
  const { user } = await validateRequest();

  if (!user) {
    redirect(Paths.Login);
  }

  const userData = await getUserById(user.id);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Security</h1>
      </div>
      <div className="grid gap-8">
        <LinkedAccounts user={userData} />
        <UpdatePassword user={userData} />
        <MultiFactorAuth />
      </div>
    </div>
  )
}