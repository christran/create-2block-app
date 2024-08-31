"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ExclamationTriangleIcon } from "@/components/icons";
import { logout } from "@/lib/auth/actions";;
import { toast } from "sonner";

export const UserDropdown = ({
  fullname,
  email,
  avatar,
  className,
}: {
  fullname: string;
  email: string;
  avatar?: string | null;
  className?: string;
}) => {
  const handleSignout = async () => {
    try {
      await logout();
      toast("You have been signed out.");
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message, {
          icon: (
            <ExclamationTriangleIcon className="h-4 w-4 text-destructive" />
          ),
        });
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={className}>
        {/* eslint @next/next/no-img-element:off */}
        <img
          src={avatar!}
          alt="Avatar"
          className="block h-8 w-8 rounded-full leading-none"
          width={64}
          height={64}
        ></img>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="text-bold">{fullname}</span><br />
          <span className="text-xs text-muted-foreground">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer text-muted-foreground"
            asChild
          >
            <Link href="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-muted-foreground"
            asChild
          >
            <Link href="/dashboard/billing">Billing</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-muted-foreground"
            asChild
          >
            <Link href="/dashboard/settings">Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer font-semibold"
            onSelect={handleSignout}
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};