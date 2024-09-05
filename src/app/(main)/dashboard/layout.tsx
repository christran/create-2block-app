import { DashboardNavbar } from "./_components/dashboard-navbar";
import { EmailVerificationWarning } from "./_components/email-verification-warning";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div>
      <main className="flex flex-1 flex-col gap-4 dark:bg-neutral-950 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <DashboardNavbar />
        <div className="grid gap-6">
          <EmailVerificationWarning />
          {children}
        </div>
       
        </div>
      </main>
    </div>
  );
}
