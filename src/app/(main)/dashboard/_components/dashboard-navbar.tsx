"use client"; // Marks this as a client-side component

// Import necessary dependencies and components
import Link from "next/link"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_TITLE_UNSTYLED, navbarItems, Paths } from "@/lib/constants";
import type { User } from "@/server/db/schema";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { PiHandPeaceLight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

// Define the props interface for the DashboardNavbar component
interface DashboardNavbarProps {
  userRole: User['role'];
}

// Define the DashboardNavbar component
export function DashboardNavbar({ userRole }: DashboardNavbarProps) {
  const path = usePathname(); // Get the current pathname
  
  return (
    <>
      <nav className="mt-4 flex-1">
        {/* Map through navbar categories */}
        <ul className="flex flex-col gap-2">
        {navbarItems.map((category) => (
          <div key={category.category} className="flex flex-col gap-1 mb-2">
            {/* Category title */}
            <h4 className="font-bold text-muted-foreground text-[10.5px] px-3 py-1">{category.category.toUpperCase()}</h4>
            <Separator/>
            {/* Map through category items */}
            {category.items.map((item) => (
              // Link wrapper, redirects to billing if user doesn't have required role
              <Link key={item.href} href={item.roles && !item.roles.some((r) => userRole.includes(r)) ? Paths.Billing : item.href}>
                <TooltipProvider delayDuration={100} disableHoverableContent={true} skipDelayDuration={50}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {/* Navigation item */}
                      <span
                        className={cn(
                          "flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-foreground/5 transition-all hover:text-primary",
                          // "flex h-8 items-center gap-2 rounded-md px-2 text-sm text-slate-11 hover:bg-slate-4 hover:text-slate-12"
                          path === item.href ? "font-semibold text-primary bg-foreground/5" : ""
                        )}
                      >
                        {/* Item icon */}
                        <item.icon className="mr-2 h-4 w-4" />
                        {/* Item title, strikethrough if user doesn't have required role */}
                        <span className={item.roles && !item.roles.some((r) => userRole.includes(r)) ? "line-through" : ""}>
                          {item.title}
                        </span>
                        {/* PRO label for non-default items */}
                        {item.roles && !item.roles.includes("default") && (
                          <span className="ml-1 text-[10px] font-bold text-yellow-500">
                            {item.roles.includes("premium") && !item.roles.includes("member") ? "PRO+" : "PRO"}
                          </span>
                        )}
                      </span>
                    </TooltipTrigger>
                    {/* Tooltip content for items user can't access */}
                    {item.roles && !item.roles.some((r) => userRole.includes(r)) && (
                      <TooltipContent className="font-medium text-sm">
                        Upgrade to access {item.title}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </Link>
            ))}
          </div>
        ))}
        
        {/* Admin section, only visible for admin user */}
        {userRole === 'admin' && (
          <>
            <Separator/>
            <Link key="admin" href={Paths.Admin}>
              <span
                className={cn(
                  "flex items-center rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-foreground/5 transition-all hover:text-primary",
                  path === Paths.Admin ? "font-semibold text-primary bg-foreground/5" : ""
                )}
              >
                <LockClosedIcon className="mr-2 h-4 w-4" />
                <span>Admin</span>
              </span>
            </Link>
          </>
        )}
        </ul>
      </nav>
    </>
  )
}