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
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth/actions";;
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Paths } from "@/lib/constants";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const UserDropdownHeader = ({
  fullname,
  email,
  avatar,
}: {
  fullname: string;
  email: string;
  avatar?: string | undefined;
  className?: string;
}) => {
  const handleSignout = async () => {
    try {
      await logout();
      toast.success("You have been successfully signed out.");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <div className="flex items-center gap-4 md:gap-2 lg:gap-4">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="rounded-full"> {/* Changed from Button to div */}
          <TooltipProvider delayDuration={400} disableHoverableContent={true}>
            <Tooltip>
              <TooltipTrigger>
                <Avatar className="relative">
                  <AvatarImage src={avatar} alt={fullname} className="object-cover" />
                  <AvatarFallback delayMs={100}>{fullname.split(' ').map(name => name.charAt(0).toUpperCase()).join('')}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </TooltipTrigger>
              <TooltipContent className="font-medium text-sm">
                {fullname}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="text-bold">{fullname}</span><br />
          <span className="text-xs text-muted-foreground">{email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link href={Paths.Billing}>Billing</Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" asChild>
          <Link href={Paths.Settings}>Settings</Link>
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