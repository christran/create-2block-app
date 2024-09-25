import { type ReactNode } from "react";
import { Header } from "../(main)/_components/header";
import { validateRequest } from "@2block/auth";
import { dotsBG } from "@/lib/constants";
import { Sidebar } from "../(main)/_components/sidebar";

const MainLayout = async ({ children }: { children: ReactNode }) => {
  const { user } = await validateRequest(); // TODO: fix this to use user-provider instead of validateRequest so it can be "use client", getUser is a protectedProcedure

  return (
    <div className="flex">
      <Sidebar
        fullname={user?.fullname ?? "Guest"}
        email={user?.email ?? "hello@2block.co"}
        userRole={user?.role ?? "guest"}
        avatar={user?.avatar ?? "/avatars/01.png"}
      />

      <div className="w-full">
        <Header
          fullname={user?.fullname ?? "Guest"}
          email={user?.email ?? "hello@2block.co"}
          userRole={user?.role ?? "guest"}
          avatar={user?.avatar ?? "/avatars/01.png"}
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