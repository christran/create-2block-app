import { type ReactNode } from "react";
import { Header } from "../(main)/_components/header";
import { validateRequest } from "@/lib/auth/validate-request";
import { dotsBG } from "@/lib/constants";
import { Sidebar } from "../(main)/_components/sidebar";

const MainLayout = async ({ children }: { children: ReactNode }) => {
  const { user } = await validateRequest();

  return (
    <div className="flex">
      <Sidebar
        userRole={user?.role ?? "guest"}
        fullname={user?.fullname ?? "Guest"}
        email={user?.email ?? "hello@2block.co"}
        avatar={user?.avatar ?? "/avatars/01.png"}
      />

      <div className="w-full">
        <Header
          fullname={user?.fullname ?? "Guest"}
          email={user?.email ?? "hello@2block.co"}
          avatar={user?.avatar ?? "/avatars/01.png"}
          userRole={user?.role ?? "guest"}
        />
        <div className={`scrollContainer h-[calc(100vh-60px)] md:overflow-auto ${dotsBG}`}>
          <div className="flex flex-col gap-6 mx-auto max-w-5xl px-4 md:px-2 items-center">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;