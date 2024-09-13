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
import { Ellipsis, EllipsisVertical } from "lucide-react";

export const UserDropdownNavBar = ({
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
    <div className="flex items-center justify-center">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center rounded-full text-xs">
          <TooltipProvider delayDuration={400} disableHoverableContent={true}>
            <Tooltip>
              <TooltipTrigger className="flex items-center h-9 hover:bg-zinc-600/10 dark:hover:bg-zinc-800/70 px-2 duration-300 rounded-lg transition-all hover:text-primary">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={avatar} alt={fullname} />
                  <AvatarFallback delayMs={100}>
                    {fullname.split(' ').map(name => name.charAt(0).toUpperCase()).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline-block ml-2 text-sm truncate max-w-[150px]">
                  {email}
                </span>
                <EllipsisVertical className="h-4 w-4 text-muted-foreground"/>
                <span className="sr-only">Toggle user menu</span>
              </TooltipTrigger>
              <TooltipContent className="font-medium text-sm">
                {fullname}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
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
          className="font-medium"
          onSelect={handleSignout}
        >
        Sign out
       </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
  );
};