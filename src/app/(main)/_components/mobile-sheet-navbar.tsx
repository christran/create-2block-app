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
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[240px] md:w-[290px]">
        <Link className="flex mb-4 items-center justify-center text-xs font-bold" href="/dashboard">
          <PiHandPeaceLight className="h-5 w-5" />{APP_TITLE_UNSTYLED}
        </Link>
        <nav className="grid gap-4 text-lg font-medium">
          {navbarItems.map((category) => (
            <div key={category.category} className="flex flex-col">
              <h3 className="font-semibold text-sm text-primary">{category.category}</h3>
              <Separator/>
              {category.items.map((item) => (
                <SheetClose key={item.href} asChild>
                  <Link href={item.roles && !item.roles.some((r) => userRole.includes(r)) ? Paths.Billing : item.href}>
                    <TooltipProvider delayDuration={100} disableHoverableContent={true} skipDelayDuration={50}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className={cn(
                              "group flex items-center rounded-lg py-2 text-md font-medium hover:bg-accent/70 hover:text-secondary-foreground",
                              path === item.href ? "font-semibold text-primary" : ""
                            )}
                          >
                            <item.icon className="mr-2 h-4 w-4" />
                            <span className={item.roles && !item.roles.some((r) => userRole.includes(r)) ? "line-through" : ""}>
                              {item.title}
                            </span>
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
                </SheetClose>
              ))}
            </div>
          ))}
          
          {userRole === 'admin' && (
            <>
              <Separator />
              <SheetClose asChild>
                <Link href={Paths.Admin}>
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
              </SheetClose>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}