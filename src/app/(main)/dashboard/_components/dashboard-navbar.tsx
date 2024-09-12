"use client";

import Link from "next/link"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navbarItems, Paths } from "@/lib/constants";
import { User } from "@/server/db/schema";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type UserRole = User['role']; // Adjust this if 'role' is a string literal type or an enum

interface DashboardNavbarProps {
  userRole: UserRole; // Use the specific type for the role property
}

export function DashboardNavbar({ userRole }: DashboardNavbarProps) {
  const path = usePathname();

  const filteredNavbarItems = navbarItems.filter(
    (item) => !item.roles || item.roles.some((r) => userRole.includes(r))
  );

  return (
    <nav className="hidden md:grid gap-2 text-sm text-muted-foreground">

      {userRole === 'admin' && (
        <Link key="admin" href={Paths.Admin}>
          <span
            className={cn(
              "group flex items-center rounded-lg px-3 py-2 text-md font-medium hover:bg-accent/70 hover:text-secondary-foreground",
              path === Paths.Admin ? "font-semibold text-primary" : ""
            )}
          >
            <LockClosedIcon className="mr-2 h-4 w-4" />
            <span>Admin</span>
          </span>
        </Link>
      )}

{navbarItems.map((item) => (
  <Link key={item.href} href={item.roles && !item.roles.some((r) => userRole.includes(r)) ? Paths.Billing : item.href}>
    <TooltipProvider delayDuration={100} disableHoverableContent={true} skipDelayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "group flex items-center rounded-lg px-3 py-2 text-md font-medium hover:bg-accent/70 hover:text-secondary-foreground",
              path === item.href ? "font-semibold text-primary" : ""
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span className={item.roles && !item.roles.some((r) => userRole.includes(r)) ? "line-through" : ""}>
              {item.title}
            </span>
            {/* Show "PRO" text only if the navbarItem doesn't have default role */}
            {item.roles && !item.roles.includes("default") && (
              <span className="ml-1 text-[10px] font-bold text-yellow-500">PRO</span>
            )}
          </span>
        </TooltipTrigger>
        {item.roles && !item.roles.some((r) => userRole.includes(r)) && (
          <TooltipContent className="font-medium text-sm">
            Upgrade to access {item.title}!
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  </Link>
))}
    </nav>
  )
}