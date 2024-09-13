"use client";

import Link from "next/link"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navbarItems, Paths, APP_TITLE_UNSTYLED } from "@/lib/constants";
import type { User } from "@/server/db/schema";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { PiHandPeaceLight } from "@/components/icons";
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet"

type UserRole = User['role'];

interface MobileSheetNavbarProps {
  userRole: UserRole;
}

export function MobileSheetNavbar({ userRole }: MobileSheetNavbarProps) {
  const path = usePathname();

  return (
    <Sheet>
      <div className="flex items-center justify-between w-full md:hidden">
        <Link className="flex items-center text-md font-bold" href={Paths.Dashboard}>
          <PiHandPeaceLight className="h-5 w-5 mr-1" />{APP_TITLE_UNSTYLED}
        </Link>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
      </div>
      <SheetContent side="left" className="w-[280px] md:w-[320px]">
        <Link className="flex mb-4 items-center justify-center font-bold" href={Paths.Dashboard}>
          <PiHandPeaceLight className="h-5 w-5" />{APP_TITLE_UNSTYLED}
        </Link>
        <nav className="mt-2 flex-1">
          <ul className="flex flex-col gap-2">
            {navbarItems.map((category) => (
              <div key={category.category} className="flex flex-col gap-1 mb-1">
              <h4 className="text-muted-foreground text-[10.5px] py-1">{category.category.toUpperCase()}</h4>
              {/* <Separator className="mb-1" /> */}
                {category.items.map((item) => (
                // Link wrapper, redirects to billing if user doesn't have required role
                <Link key={item.href} href={item.roles && !item.roles.some((r) => userRole.includes(r)) ? Paths.Billing : item.href}>
                  <TooltipProvider delayDuration={100} disableHoverableContent={true} skipDelayDuration={50}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {/* Navigation item */}
                        <span
                          className={cn(
                            "flex h-9 items-center rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-zinc-600/10 dark:hover:bg-zinc-800/70 transition-all hover:text-primary",
                            // "flex h-8 items-center gap-2 rounded-md px-2 text-sm text-slate-11 hover:bg-slate-4 hover:text-slate-12"
                            path === item.href ? "text-primary bg-zinc-600/10 dark:bg-zinc-800/70" : ""
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
            
            {userRole === 'admin' && (
              <>
                <Separator />
                <SheetClose asChild>
                  <Link key="admin" href={Paths.Admin}>
                    <span
                      className={cn(
                        "flex h-9 items-center rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-zinc-600/10 dark:hover:bg-zinc-800/70 transition-all hover:text-primary",
                        path === Paths.Admin ? "text-primary bg-zinc-600/10 dark:bg-zinc-800/70" : ""
                      )}
                    >
                      <LockClosedIcon className="mr-2 h-4 w-4" />
                      <span>Admin</span>
                    </span>
                </Link>
                </SheetClose>
              </>
            )}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}