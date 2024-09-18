"use client";

import { useNavbarStore } from "@/store/navbar-store";
import { DashboardNavbar } from "../(dashboard)/_components/dashboard-navbar";
import { UserDropdownNavBar } from "./user-dropdown-navbar";
import Link from "next/link";
import { PiHandPeaceLight } from "@/components/icons";
import { APP_TITLE_UNSTYLED, Paths } from "@/lib/constants";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CollapseButton } from "./collapse-button";
import { cn } from "@/lib/utils";

interface CollapsibleNavbarProps {
  userRole: string;
  fullname: string;
  email: string;
  avatar: string;
}

export function CollapsibleNavbar({ userRole, fullname, email, avatar }: CollapsibleNavbarProps) {
  const { isCollapsed, toggleCollapse } = useNavbarStore();

  return (
    <nav 
      className={cn(
        "z-40 hidden md:inline-block md:visible bg-secondary/20 transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-[70px]" : "w-[290px]"
      )}
    >
      <aside className="dark:bg-root flex h-screen flex-shrink-0 flex-col justify-between border-r pb-6 px-4 overflow-hidden">
        <div className="flex flex-col">
          <div className={cn("flex h-[60px] items-center justify-center")}>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link 
                    className={cn(
                      "flex items-center text-lg font-extrabold text-primary/75 hover:text-yellow-400/90",
                      isCollapsed ? "justify-center w-8 h-8" : "w-full"
                    )}
                    href={Paths.Dashboard}
                  >
                    <PiHandPeaceLight className={cn(
                      "flex-shrink-0",
                      isCollapsed ? "h-full w-full" : "h-8 w-8"
                    )} />
                    <span className={cn(
                      "transition-opacity duration-700 ease-in-out",
                      isCollapsed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
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
          <DashboardNavbar userRole={userRole} isCollapsed={isCollapsed} />
        </div>

        <UserDropdownNavBar
          fullname={fullname}
          email={email}
          avatar={avatar}
          withSheetClose={false}
          isCollapsed={isCollapsed}
        />
      </aside>
      <CollapseButton isCollapsed={isCollapsed} onClick={toggleCollapse} />
    </nav>
  );
}