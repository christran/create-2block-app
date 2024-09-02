import { DashboardNavbar } from "./_components/dashboard-navbar";
import { UpdateEmailWarning } from "./_components/update-email-warning";
import { VerificiationWarning } from "./_components/verificiation-warning";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <div>
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
        <DashboardNavbar />
        <div className="grid gap-6">
          <UpdateEmailWarning />
          <VerificiationWarning />
          {children}
        </div>
       
        </div>
      </main>
    </div>
  );
}
