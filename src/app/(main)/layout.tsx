"use client";

import { type ReactNode } from "react";
import { Header } from "./_components/header";
import { Sidebar } from "./_components/sidebar";
import { EmailVerificationWarning } from "./(dashboard)/_components/email-verification-warning";
import { dotsBG } from "@/lib/constants";
import { useUser } from "@/lib/auth/user-provider";

const MainLayout = ({ children }: { children: ReactNode }) => {
  const userData = useUser();

  return (
    <div className="flex">
      <Sidebar
        fullname={userData?.fullname ?? "Guest"}
        email={userData?.email ?? ""}
        userRole={userData?.role ?? "guest"}
        avatar={userData?.avatar ?? ""}
      />

      <div className="w-full">
        <Header
          fullname={userData?.fullname ?? ""}
          email={userData?.email ?? ""}
          userRole={userData?.role ?? "guest"}
          avatar={userData?.avatar ?? ""}
        />
        <div className={`scrollContainer h-[calc(100vh-60px)] md:overflow-auto ${dotsBG}`}>
          {userData?.emailVerified === false && (
            <div className="mx-auto pt-8">
              <div className="flex flex-col gap-6 mx-auto max-w-5xl px-4 md:px-2">
                <EmailVerificationWarning emailVerified={userData?.emailVerified} />
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
