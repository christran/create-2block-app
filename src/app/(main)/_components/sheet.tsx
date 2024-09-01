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

export const HeaderSideSheet = async () => {

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
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link className="flex items-center justify-center text-xs font-bold" href="/dashboard">
              <PiHandPeaceLight className="h-5 w-5" />{APP_TITLE_UNSTYLED}
            </Link>
            <Link
              href={Paths.Dashboard}
              className="text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
  );
};
