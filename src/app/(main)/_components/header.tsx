import { PiHandPeaceLight } from "@/components/icons";
import { APP_TITLE_UNSTYLED, Paths } from "@/lib/constants";
import { UserDropdownHeader } from "@/app/(main)/_components/user-dropdown-header";
import { validateRequest } from "@/lib/auth/validate-request";
import Link from "next/link"
import { MobileSheetNavbar } from "./mobile-sheet-navbar";
import { Button } from "@/components/ui/button";
import { PiChatCenteredDotsLight } from "react-icons/pi";

export const Header = async () => {
  const { user } = await validateRequest();

  return (
    <header className="flex h-[60px] items-center justify-end border-b border-slate-6 px-6">
      <MobileSheetNavbar userRole={user?.role ?? "default"} />
      <div className="hidden items-center gap-4 md:flex">
      <div className="w-full flex-1">
        {/* <UserDropdownHeader 
          fullname={user?.fullname ?? ''} 
          email={user?.email ?? ''} 
          avatar={user?.avatar ?? ''} 
        /> */}
      <Link href={Paths.GitHub}>
        <Button variant="outline" className="text-muted-foreground text-xs">
          <span className="inline-flex items-center justify-center gap-1 truncate">
            <PiChatCenteredDotsLight className="h-5 w-5" />
            Support
          </span>
        </Button>
      </Link>
      </div>
      </div>
    </header>
  );
};
