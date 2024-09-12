"use client";

import { PiHandPeaceLight } from "@/components/icons";
import { APP_TITLE_UNSTYLED, navbarItems } from "@/lib/constants";
import Link from "next/link"
import { Menu } from "lucide-react"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function MobileSheetNavbar() {
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
          <nav className="grid gap-6 text-lg font-medium">
            {navbarItems.map((item) => (
              <SheetClose key={item.title} asChild>
                <Link href={item.href}>
                  <span
                    className={cn(
                      "flex items-center text-muted-foreground hover:text-foreground",
                      path === item.href ? "font-semibold text-primary" : "",
                    )}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </span>
                </Link>
              </SheetClose>
            ))} 
          </nav>
        </SheetContent>
      </Sheet>
  );
};
