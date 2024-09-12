// import { DashboardNavbar } from "../_components/dashboard-navbar";

interface Props {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: Props) {
  return (
    <main className="gap-4 p-4 md:gap-8 md:p-10">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
      {/* <DashboardNavbar /> */}
      <div className="grid gap-6">
        {children}
      </div>
      
      </div>
    </main>
  );
}
