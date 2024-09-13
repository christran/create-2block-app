"use client"; // Marks this as a client-side component

// Import necessary dependencies and components
import Link from "next/link"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navbarItems, Paths } from "@/lib/constants";
import type { User } from "@/server/db/schema";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

// Define the props interface for the DashboardNavbar component
interface DashboardNavbarProps {
  userRole: User['role'];
}

// Define the DashboardNavbar component
export function DashboardNavbar({ userRole }: DashboardNavbarProps) {
  const path = usePathname(); // Get the current pathname

  return (
    // Main navigation container
    <nav className="hidden md:flex flex-col gap-4 text-sm text-muted-foreground">

      {/* Map through navbar categories */}
      {navbarItems.map((category) => (
        <div key={category.category} className="flex flex-col gap-2">
          {/* Category title */}
          <h3 className="font-semibold text-primary px-3 py-1">{category.category}</h3>
          {/* <Separator/> */}
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
                        "group flex items-center rounded-lg px-3 py-2 text-md font-medium hover:bg-accent/70 hover:text-secondary-foreground",
                        path === item.href ? "font-semibold text-primary" : ""
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
                      Upgrade to access {item.title}!
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </Link>
          ))}
        </div>
      ))}
      
      {/* Admin section, only visible for admin users */}
      {userRole === 'admin' && (
        <>
          <Separator/>
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
        </>
      )}
    </nav>
  )
}