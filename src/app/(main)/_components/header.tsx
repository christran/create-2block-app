import { ExclamationTriangleIcon, PiHandPeaceLight } from "@/components/icons";
import { APP_TITLE_UNSTYLED, Paths } from "@/lib/constants";
import { UserDropdown } from "@/app/(main)/_components/user-dropdown";
import { validateRequest } from "@/lib/auth/validate-request";
import { logout } from "@/lib/auth/actions";;
import Link from "next/link"
import { CircleUser, Menu, Package2, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
// import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { HeaderSideSheet } from "./sheet";

export const Header = async () => {
  const { user } = await validateRequest();

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
    <header className="sticky top-0 flex h-16 items-center justify-between gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link className="flex items-center justify-center text-xs font-bold" href="/dashboard">
            <PiHandPeaceLight className="h-5 w-5" />{APP_TITLE_UNSTYLED}
          </Link>
          {/* <Link
            href={Paths.Dashboard}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link> */}
        </nav>
        <HeaderSideSheet />
        <UserDropdown 
          fullname={user?.fullname ?? ''} 
          email={user?.email ?? ''} 
          avatar={user?.avatar ?? ''} 
          className="ml-auto" 
        />
    </header>
  );
};
