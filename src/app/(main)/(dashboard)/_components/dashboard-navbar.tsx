"use client";

import Link from "next/link"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { guestNavBarItems, navbarItems, Paths } from "@/lib/constants";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LockClosedIcon } from "@radix-ui/react-icons";

interface DashboardNavbarProps {
  userRole: string;
  isClosed: boolean;
}

const inactiveLinkClass = "flex h-9 items-center justify-between rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-zinc-600/10 dark:hover:bg-zinc-800/70 transition-all hover:text-primary"
const activeLinkClass = "text-primary bg-zinc-600/10 dark:bg-zinc-800/70"

export function DashboardNavbar({ userRole, isClosed }: DashboardNavbarProps) {
  const path = usePathname();
  
  return (
    <>
      {userRole !== "guest" ? (
        <nav className="mt-2 flex-1">
            <ul className={cn("flex flex-col gap-2", isClosed ? "" : "")}>
              {navbarItems.map((category, index) => (
              <li key={category.category}>
                {isClosed && index > 0 && (
                  <Separator />
                )}
                <div className="flex flex-col gap-1 mb-1">
                  <h4 className={`text-muted-foreground text-[10.5px] py-1 transition-all duration-300 ease-in-out ${
                    isClosed ? "opacity-0 h-0 overflow-hidden" : "opacity-100 h-auto"
                  }`}>
                    {category.category.toUpperCase()}
                  </h4>
                  {category.items.map((item) => (
                    <Link key={item.href} href={item.roles && !item.roles.some((r) => userRole.includes(r)) ? Paths.Billing : item.href}>
                      <TooltipProvider delayDuration={100} disableHoverableContent={true} skipDelayDuration={50}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={cn(
                                inactiveLinkClass,
                                path === item.href ? activeLinkClass : "",
                                isClosed ? "justify-center" : "",
                                "transition-none duration-300 ease-in-out"
                              )}
                            >
                              <span className="flex items-center">
                                <item.icon className={cn(
                                  "transition-all duration-300 ease-in-out",
                                  isClosed ? "h-6 w-6" : "h-5 w-5 mr-2"
                                )} 
                              />
                                <span 
                                  className={cn(
                                    "transition-all duration-300 ease-in-out whitespace-nowrap",
                                    isClosed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100",
                                    item.roles && !item.roles.some((r) => userRole.includes(r)) ? "line-through" : ""
                                  )}
                                >
                                  {item.title}
                                </span>
                              </span>
                              {!isClosed && item.roles && !item.roles.includes("default") && (
                                <Badge 
                                  variant="default" 
                                  className="text-[9px] px-1.5 py-0.1 rounded-lg font-extrabold text-yellow-400 hover:text-yellow-500 dark:text-yellow-500 bg-primary/75 dark:bg-accent/50 hover:bg-yellow-400/15 dark:hover:bg-yellow-400/20 transition-opacity duration-300 ease-in-out"
                                >
                                  {item.roles.includes("premium") && !item.roles.includes("member") ? "PRO+" : "PRO"}
                                </Badge>
                              )}
                              {!isClosed && item.beta && (
                                <Badge 
                                  variant="outline" 
                                  className="text-[9px] px-1.5 py-0.1 rounded-lg font-extrabold text-blue-400 hover:text-blue-500 dark:text-blue-500 border-blue-400/50 dark:border-blue-500/50 hover:bg-blue-400/15 dark:hover:bg-blue-400/20 transition-opacity duration-300 ease-in-out"
                                >
                                  BETA
                                </Badge>
                              )}
                            </span>
                          </TooltipTrigger>
                          {isClosed && (
                            <TooltipContent side="right" align="center" className="text-sm font-medium">
                              {item.title}
                            </TooltipContent>
                          )}
                          {item.roles && !isClosed && !item.roles.some((r) => userRole.includes(r)) && (
                            <TooltipContent align="center" className="text-sm font-medium">
                              Upgrade to access {item.title}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </Link>  
                  ))}
                </div>
              </li>
            ))}
            
            {userRole === "admin" && (
              <>
                <Separator className="transition-opacity duration-300 ease-in-out" />
                <li>
                  <Link href={Paths.Admin}>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={cn(
                              inactiveLinkClass,
                              path === Paths.Admin ? activeLinkClass : "",
                              isClosed ? "justify-center" : "",
                              "transition-none duration-300 ease-in-out"
                            )}
                          >
                            <span className="flex items-center">
                              <LockClosedIcon className={cn(
                                "transition-all duration-300 ease-in-out",
                                isClosed ? "h-6 w-6" : "h-5 w-5 mr-2"
                              )} />
                              <span 
                                className={cn(
                                  "transition-all duration-300 ease-in-out whitespace-nowrap",
                                  isClosed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
                                )}
                              >
                                Admin
                              </span>
                            </span>
                          </span>
                        </TooltipTrigger>
                        {isClosed && (
                          <TooltipContent side="right" align="center">
                            Admin
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </Link>
                </li>
              </>
            )}
            </ul>
        </nav>
      ) : (
        <nav className="mt-5 flex-1">
            <ul className={cn("flex flex-col gap-2", isClosed ? "" : "")}>
            <div className="flex flex-col gap-2 mb-1">
              {guestNavBarItems.map((item) => (
              
                <li key={item.href}>
                  <Link href={item.href}>
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className={cn(
                            inactiveLinkClass, 
                            path === item.href ? activeLinkClass : "",
                            isClosed ? "justify-center" : "",
                            "transition-none duration-300 ease-in-out"
                            )}>
                              <span className="flex items-center">
                                <item.icon className={cn(
                                  "transition-all duration-300 ease-in-out",
                                  isClosed ? "h-6 w-6" : "h-5 w-5 mr-2"
                              )}
                              />
                              <span 
                                className={cn(
                                  "transition-all duration-300 ease-in-out whitespace-nowrap",
                                  isClosed ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
                                )}
                              >
                                {item.title}
                              </span>
                            </span>
                          </span>
                        </TooltipTrigger>
                        {isClosed && (
                          <TooltipContent side="right" align="center" className="text-sm font-medium">
                            {item.title}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </Link>
                </li>
              ))}
            </div>
            </ul>
        </nav>
      )}
    </>
  );
}