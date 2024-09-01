import { MultiFactorAuth } from "./_components/multifactorauth";
import { UpdatePassword } from "./_components/update-password";

export default async function SecurityPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold md:text-4xl">Security</h1>
      </div>
      <div className="grid gap-8">
        <UpdatePassword />
        <MultiFactorAuth />
      </div>
    </div>
  )
}