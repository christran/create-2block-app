"use client";

import { DashboardNavbar } from "../(dashboard)/_components/dashboard-navbar";
import { UserDropdownNavBar } from "./user-dropdown-navbar";
import Link from "next/link";
import { PiHandPeaceLight } from "@/components/icons";
import { APP_TITLE_UNSTYLED, Paths } from "@/lib/constants";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { SidebarToggle } from "./sidebar-button";
import { cn } from "@/lib/utils";
import { useSidebarToggle } from "@/hooks/use-sidebar-toggle";
import { useStore } from "@/store/use-store";
import type { User } from "@/server/db/schema";

type UserRole = User["role"];

interface SidebarProps {
  fullname: string;
  email: string;
  userRole: UserRole;
  avatar: string;
}

export function Sidebar({ fullname, email, userRole, avatar, }: SidebarProps) {
  const sidebar = useStore(useSidebarToggle, (state) => state);

  // if(!sidebar) return null;

  return (
    <div className="z-40 hidden md:inline-block md:visible bg-secondary/20 relative">
      <aside className={cn(
        "dark:bg-root flex h-screen flex-shrink-0 flex-col justify-between border-r pb-6 px-4 overflow-hidden transition-all ease-in-out duration-300",
        sidebar?.isClosed ? "w-[75px]" : "w-[250px]"
      )}
      >
        <div className="flex flex-col">
          <div className={cn("flex h-[60px] items-center justify-center")}>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link 
                    className={cn(
                      "flex items-center text-lg font-extrabold text-primary/75 hover:text-yellow-400/90",
                      sidebar?.isClosed? "justify-center w-8 h-8" : "w-full"
                    )}
                    href={Paths.Home}
                  >
                    <PiHandPeaceLight className={cn(
                      "flex-shrink-0",
                      sidebar?.isClosed ? "h-full w-full" : "h-8 w-8"
                    )} />
                    <span className={cn(
                      "transition-opacity duration-700 ease-in-out",
                      sidebar?.isClosed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
                    )}>
                      {APP_TITLE_UNSTYLED}
                    </span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="z-50 font-bold text-xs">
                  ✌️BLOCK!
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <DashboardNavbar userRole={userRole} isClosed={sidebar?.isClosed ?? false} />
        </div>

        <UserDropdownNavBar
          fullname={fullname}
          email={email}
          avatar={avatar}
          withSheetClose={false}
          isClosed={sidebar?.isClosed ?? false}
        />
      </aside>

      <SidebarToggle isClosed={sidebar?.isClosed} setIsClosed={sidebar?.setIsClosed} />
    </div>
  );
}