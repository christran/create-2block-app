import { PiHandPeaceLight } from "@/components/icons";
import { APP_TITLE_UNSTYLED, Paths } from "@/lib/constants";
import { UserDropdown } from "@/app/(main)/_components/user-dropdown";
import { validateRequest } from "@/lib/auth/validate-request";
import Link from "next/link"
import { MobileSheetNavbar } from "./mobile-sheet-navbar";

export const Header = async () => {
  const { user } = await validateRequest();

  // Generate a random color for hover effect
  const colors = ['blue', 'teal'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/85 backdrop-blur-sm px-4 md:px-6">
      <div className="container flex items-center justify-between gap-2 px-2 py-2 lg:px-10">
        <div className="flex items-center gap-4">
          <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          </nav>
          <MobileSheetNavbar userRole={user?.role ?? "default"} />
          <Link className={`flex items-center justify-center text-xs font-bold hover:text-${randomColor}-500`} href="/dashboard">
            <PiHandPeaceLight className="h-5 w-5" />{APP_TITLE_UNSTYLED}
          </Link>
        </div>
        <UserDropdown 
          fullname={user?.fullname ?? ''} 
          email={user?.email ?? ''} 
          avatar={user?.avatar ?? ''} 
        />
      </div>
    </header>
  );
};
