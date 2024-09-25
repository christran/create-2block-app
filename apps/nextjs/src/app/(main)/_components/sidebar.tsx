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
import { motion } from "framer-motion";
import { useState } from "react";

type UserRole = User["role"];

interface SidebarProps {
  fullname: string;
  email: string;
  userRole: UserRole;
  avatar: string;
}

export function Sidebar({ fullname, email, userRole, avatar }: SidebarProps) {
  const sidebar = useStore(useSidebarToggle, (state) => state);
  const [isWaving, setIsWaving] = useState(false);

  const waveAnimation = {
    rotate: [0, -25, 15, -20, 0],
    transition: { 
      duration: 1, 
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "loop",
      repeatDelay: 1
    }
  };

  return (
    <div className="z-40 hidden md:inline-block md:visible bg-secondary/20 relative">
      <aside className={cn(
        "dark:bg-root flex h-screen flex-shrink-0 flex-col justify-between border-r pb-6 px-4 overflow-hidden transition-all ease-in-out duration-300",
        sidebar?.isClosed ? "w-[75px]" : "w-[250px]"
      )}
      >
        <div className="flex flex-col">
            <div className={cn("flex h-[60px] items-center", sidebar?.isClosed ? "justify-center" : "justify-start")}>
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link 
                    className={cn(
                      "flex text-primary/75 hover:text-yellow-400/90",
                      sidebar?.isClosed ? "w-9 h-9" : ""
                    )}
                    href={Paths.Home}
                    onMouseEnter={() => setIsWaving(true)}
                    onMouseLeave={() => setIsWaving(false)}
                  >
                    <motion.div 
                      className="flex-shrink-0"
                      animate={isWaving ? waveAnimation : {}}
                    >
                      <PiHandPeaceLight className={cn(
                        sidebar?.isClosed ? "h-full w-full" : "h-9 w-9"
                      )} />
                    </motion.div>
                    <motion.span
                      className="overflow-hidden"
                      initial={false}
                      animate={{
                        width: sidebar?.isClosed ? 0 : "auto",
                        opacity: sidebar?.isClosed ? 0 : 1,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: "easeInOut",
                      }}
                    >
                      <div className="mt-[3px] text-xl font-extrabold">
                        {APP_TITLE_UNSTYLED}
                      </div>
                    </motion.span>
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