import { type ReactNode } from "react";
import { Header } from "./_components/header";
import { Sidebar } from "./_components/sidebar";
import { EmailVerificationWarning } from "./(dashboard)/_components/email-verification-warning";
import { dotsBG } from "@/lib/constants";
import { useUser } from "@/lib/auth/user-provider";
import { validateRequest } from "@2block/auth";

const MainLayout = async ({ children }: { children: ReactNode }) => {
  const { user: userData } = await validateRequest();

  /*
  This is a client component, so we need to use the server component to get the user data 
  but trpc unauthorized bug when user is not logged in 
  and trying to access the user data or any protected page 
  */
  // const userData = useUser(); 

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
