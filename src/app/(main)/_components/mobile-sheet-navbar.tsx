"use client";

import Link from "next/link"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navbarItems, Paths, APP_TITLE_UNSTYLED, guestNavBarItems } from "@/lib/constants";
import type { User } from "@/server/db/schema";
import { LockClosedIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { PiHandPeaceLight } from "@/components/icons";
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle";
import { UserDropdownNavBar } from "./user-dropdown-navbar";

type UserRole = User['role'];

interface MobileSheetNavbarProps {
  fullname: string,
  email: string,
  avatar: string,
  userRole: UserRole;
}

const inactiveLinkClass = "flex h-9 items-center justify-between rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-zinc-600/10 dark:hover:bg-zinc-800/70 transition-all hover:text-primary"
const activeLinkClass = "text-primary bg-zinc-600/10 dark:bg-zinc-800/70"

export function MobileSheetNavbar({ fullname, email, avatar, userRole }: MobileSheetNavbarProps) {
  const path = usePathname();

  return (
    <>
      {userRole !== "guest" ? (
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
          <SheetContent side="left" onOpenAutoFocus={(event) => event.preventDefault()} className="w-[280px] md:w-[320px] flex flex-col">
            <Link className="flex items-center justify-center font-bold" href={Paths.Dashboard}>
              <PiHandPeaceLight className="h-5 w-5" />{APP_TITLE_UNSTYLED}
            </Link>
            <nav className="flex-1 overflow-scroll scrollbar-hide">
              <ul className="flex flex-col gap-2">
                {navbarItems.map((category) => (
                  <li>
                    <div key={category.category} className="flex flex-col gap-1 mb-1">
                    <h4 className="text-muted-foreground text-[10.5px] py-1">{category.category.toUpperCase()}</h4>
                    {/* <Separator className="mb-1" /> */}
                      {category.items.map((item) => (
                      // Link wrapper, redirects to billing if user doesn't have required role
                      <SheetClose asChild>
                        <Link key={item.href} href={item.roles && !item.roles.some((r) => userRole.includes(r)) ? Paths.Billing : item.href}>
                          <TooltipProvider delayDuration={100} disableHoverableContent={true} skipDelayDuration={50}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {/* Navigation item */}
                                <span
                                  className={cn(
                                    inactiveLinkClass,
                                    path === item.href ? activeLinkClass : ""
                                  )}
                                >
                                  {/* Item icon */}
                                  <span className="flex items-center">
                                    <item.icon className="mr-2 h-5 w-5" />
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
                      </SheetClose>
                    ))}
                    </div>
                  </li>
                ))}
                
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
                                <LockClosedIcon className="mr-2 h-5 w-5" />
                                <span>Admin</span>
                            </span>
                          </span>
                        </Link>
                    </div>
                  </>
                )}
              </ul>
            </nav>
            <UserDropdownNavBar
              fullname={fullname}
              email={email} 
              avatar={avatar} 
            />
          </SheetContent>
        </Sheet>
        ) : (
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
          <SheetContent side="left" onOpenAutoFocus={(event) => event.preventDefault()} className="w-[280px] md:w-[320px] flex flex-col">
            <Link className="flex items-center justify-center font-bold" href={Paths.Dashboard}>
              <PiHandPeaceLight className="h-5 w-5" />{APP_TITLE_UNSTYLED}
            </Link>
            <nav className="mt-2 flex-1">
              <ul className="flex flex-col gap-2">
              {guestNavBarItems.map((item) => (
                <li>
                  <Link key={item.href} href={item.href}>
                    <span
                      className={cn(
                        inactiveLinkClass,
                        path === item.href ? activeLinkClass : ""
                      )}
                    >
                      <span className="flex items-center">
                        <item.icon className="mr-2 h-5 w-5" />
                        {item.title}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
              </ul>
            </nav>
            <UserDropdownNavBar
                fullname={"Guest"} 
                email={"hello@2block.co"} 
                avatar={"/avatars/01.png"}
            />
            </SheetContent>
          </Sheet>
        )}
    </>
  );
}