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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Paths } from "@/lib/constants";

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
    <div className="flex items-center gap-4 md:gap-2 lg:gap-4">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
        <Avatar>
          <AvatarImage src={avatar} alt={fullname} />
          <AvatarFallback delayMs={100}>{fullname.split(' ').map(name => name.charAt(0).toUpperCase()).join('')}</AvatarFallback>
        </Avatar>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="text-bold">{fullname}</span><br />
          <span className="text-xs text-muted-foreground">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link href={Paths.Settings}>Manage Account</Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link href={Paths.Billing}>Billing</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="font-semibold"
          onSelect={handleSignout}
        >
        Sign out
       </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  );
};