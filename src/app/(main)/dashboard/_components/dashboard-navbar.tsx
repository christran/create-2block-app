"use client";

import Link from "next/link"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navbarItems, Paths } from "@/lib/constants";


export function DashboardNavbar() {
  const path = usePathname();

  return (
    <nav className="hidden md:grid gap-2 text-sm text-muted-foreground">
      {navbarItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <span
            className={cn(
              "group flex items-center rounded-lg px-3 py-2 text-md font-medium hover:bg-accent hover:text-accent-foreground",
              path === item.href ? "font-semibold text-primary" : "",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </span>
        </Link>
      ))}
    </nav>
  )
}