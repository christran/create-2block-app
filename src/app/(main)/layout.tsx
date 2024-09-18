import { type ReactNode } from "react";
import { Header } from "./_components/header";
import { Sidebar } from "./_components/sidebar";
import { validateRequest } from "@/lib/auth/validate-request";
import { EmailVerificationWarning } from "./(dashboard)/_components/email-verification-warning";
import { dotsBG } from "@/lib/constants";

const MainLayout = async ({ children }: { children: ReactNode }) => {
  const { user } = await validateRequest();

  return (
    <div className="flex">
      <Sidebar
        userRole={user?.role ?? "guest"}
        fullname={user?.fullname ?? "Guest"}
        email={user?.email ?? ""}
        avatar={user?.avatar ?? ""}
      />

      <div className="w-full">
        <Header
          fullname={user?.fullname ?? ""}
          email={user?.email ?? ""}
          avatar={user?.avatar ?? ""}
          userRole={user?.role ?? "guest"}
        />
        <div className={`scrollContainer h-[calc(100vh-60px)] md:overflow-auto ${dotsBG}`}>
          {user?.emailVerified === false && (
            <div className="mx-auto pt-8">
              <div className="flex flex-col gap-6 mx-auto max-w-5xl px-4 md:px-2">
                <EmailVerificationWarning />
              </div>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
