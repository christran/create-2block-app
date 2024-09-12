import { validateRequest } from "@/lib/auth/validate-request";
import { DashboardNavbar } from "./_components/dashboard-navbar";
import { EmailVerificationWarning } from "./_components/email-verification-warning";

interface Props {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: Props) {
  const { user } = await validateRequest();

  return (
    <main className="gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
      <DashboardNavbar userRole={user?.role ?? "default"} />
      <div className="grid gap-6">
        <EmailVerificationWarning />
        {children}
      </div>
      
      </div>
    </main>
  );
}
