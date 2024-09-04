import { PiHandPeaceLight } from "@/components/icons";
import { APP_TITLE_UNSTYLED } from "@/lib/constants";
import { UserDropdown } from "@/app/(main)/_components/user-dropdown";
import { validateRequest } from "@/lib/auth/validate-request";
import Link from "next/link"
import { MobileSheetNavbar } from "./mobile-sheet-navbar";

export const Header = async () => {
  const { user } = await validateRequest();

  return (
    <header className="sticky top-0 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="container flex items-center justify-between gap-2 px-2 py-2 lg:px-10">
        <div className="flex items-center gap-4">
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
          <MobileSheetNavbar />
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
