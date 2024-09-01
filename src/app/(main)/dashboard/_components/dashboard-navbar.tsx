"use client";

import Link from "next/link"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Paths } from "@/lib/constants";
import { FileTextIcon, CreditCard } from "@/components/icons";
import { LockClosedIcon, PersonIcon } from "@radix-ui/react-icons";

const items = [
  {
    title: "Dashboard",
    href: Paths.Dashboard,
    icon: FileTextIcon,
  },
  {
    title: "Billing",
    href: Paths.Billing,
    icon: CreditCard,
  },
  {
    title: "Profile",
    href: Paths.Settings,
    icon: PersonIcon,
  },

  {
    title: "Security",
    href: Paths.Security,
    icon: LockClosedIcon,
  }
];

export function SettingsNavbar() {
  const path = usePathname();

  return (
    <nav className="hidden md:grid gap-2 text-sm text-muted-foreground">
      {items.map((item) => (
        <Link href={item.href} key={item.href}>
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