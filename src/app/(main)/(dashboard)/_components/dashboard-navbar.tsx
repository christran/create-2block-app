"use client"; // Marks this as a client-side component

// Import necessary dependencies and components
import Link from "next/link"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_TITLE_UNSTYLED, guestNavBarItems, navbarItems, Paths } from "@/lib/constants";
import type { User } from "@/server/db/schema";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

// Define the props interface for the DashboardNavbar component
interface DashboardNavbarProps {
  userRole: User['role'];
}

const inactiveLinkClass = "flex h-9 items-center justify-between rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-zinc-600/10 dark:hover:bg-zinc-800/70 transition-all hover:text-primary"
const activeLinkClass = "text-primary bg-zinc-600/10 dark:bg-zinc-800/70"

// Define the DashboardNavbar component
export function DashboardNavbar({ userRole }: DashboardNavbarProps) {
  const path = usePathname(); // Get the current pathname
  
  return (
    <>
      {userRole !== "guest" ? (
        <nav className="mt-2 flex-1">
          {/* Map through navbar categories */}
          <ul className="flex flex-col gap-2">
          {navbarItems.map((category) => (
            <div key={category.category} className="flex flex-col gap-1 mb-1">
              {/* Category title */}
              <h4 className="text-muted-foreground text-[10.5px] py-1">{category.category.toUpperCase()}</h4>
              {/* <Separator className="mb-1" /> */}
              {/* Map through category items */}
              {category.items.map((item) => (
                // Link wrapper, redirects to billing if user doesn't have required role
                <Link key={item.href} href={item.roles && !item.roles.some((r) => userRole.includes(r)) ? Paths.Billing : item.href}>
                  <TooltipProvider delayDuration={100} disableHoverableContent={true} skipDelayDuration={50}>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <span
                          className={cn(
                            inactiveLinkClass,
                            path === item.href ? activeLinkClass : ""
                          )}
                        >
                          <span className="flex items-center">
                            <item.icon className="mr-2 h-4 w-4" />
                            <span className={item.roles && !item.roles.some((r) => userRole.includes(r)) ? "line-through" : ""}>
                              {item.title}
                            </span>
                          </span>
                          {item.roles && !item.roles.includes("default") && (
                            <Badge variant="default" className="text-[9px] px-1.5 py-0.1 rounded-lg font-extrabold text-yellow-400 hover:text-yellow-500 dark:text-yellow-500 bg-primary/75 dark:bg-accent/50 hover:bg-yellow-400/15 dark:hover:bg-yellow-400/20">
                              {item.roles.includes("premium") && !item.roles.includes("member") ? "PRO+" : "PRO"}
                            </Badge>
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
              <div className="flex flex-col gap-1 mb-1">
                <Separator/>
                  <Link key="admin" href={Paths.Admin}>
                    <span
                      className={cn(
                        inactiveLinkClass,
                        path === Paths.Admin ? activeLinkClass : ""
                      )}
                    >
                      <span className="flex items-center">
                          <LockClosedIcon className="mr-2 h-4 w-4" />
                          <span>Admin</span>
                      </span>
                    </span>
                  </Link>
              </div>
            </>
          )}
          </ul>
        </nav>
      ) : (
        <nav className="mt-2 flex-1">
          <ul className="flex flex-col gap-2">
          {guestNavBarItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  inactiveLinkClass,
                  path === item.href ? activeLinkClass : ""
                )}
              >
                <span className="flex items-center">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </span>
              </span>
            </Link>
          ))}
          </ul>
        </nav>
      )}
    </>
  )
}