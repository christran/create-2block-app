import { type ReactNode } from "react";
import { Header } from "../(main)/_components/header";
import { Footer } from "./_components/footer";
import Link from "next/link";
import { PiHandPeaceLight } from "@/components/icons";
import { APP_TITLE_UNSTYLED, Paths } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { DashboardNavbar } from "../(main)/(dashboard)/_components/dashboard-navbar";
import { validateRequest } from "@/lib/auth/validate-request";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UserDropdownNavBar } from "../(main)/_components/user-dropdown-navbar";
import { Badge } from "@/components/ui/badge";
import { EmailVerificationWarning } from "../(main)/(dashboard)/_components/email-verification-warning";
import { LandingPageNavbar } from "./_components/landing-page-navbar";

const MainLayout = async ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex">
      <nav className="bg-secondary/20">
        <aside className="dark:bg-root hidden h-screen w-[250px] flex-shrink-0 flex-col justify-between border-r border-slate-4 bg-slate-1 px-4 pb-6 dark:border-slate-6 md:flex">
          <div className="flex h-[60px] items-center">
            <Link className={`flex items-center text-lg font-extrabold text-primary/75 hover:text-yellow-400/90`} href={Paths.Dashboard}>
              <PiHandPeaceLight className="h-7 w-7" />{APP_TITLE_UNSTYLED}
            </Link>
            <div className="ml-auto">
            {/* <ThemeToggle /> */}
            </div>
   
          </div>

          {/* <LandingPageNavbar /> */}
          <DashboardNavbar userRole="guest" />
          
          {/* <Card className="mb-4">
            <CardHeader className="p-4">
              <CardTitle className="text-sm flex items-center gap-1">
                Login
              </CardTitle>
              <CardDescription className="text-xs">
                You have to login before you can do anything.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <Link href={Paths.Login}>
                <Button size="sm" className="w-full text-xs">
                  Login
                </Button>
              </Link>
            </CardContent>
          </Card> */}

          <UserDropdownNavBar
            fullname={"Guest"} 
            email={"hello@2block.co"} 
            avatar={"/avatars/01.png"}
          />
        </aside>
      </nav>

      <div className="w-full">
        <Header 
          fullname={"Guest"} 
          email={"hello@2block.co"} 
          avatar={"/avatars/01.png"}
          userRole={'guest'} 
        />
        <div className="scrollContainer h-[calc(100vh-60px)] overflow-auto">
          <div className="flex items-center justify-center">
            <div className="flex flex-col gap-6 mx-auto max-w-5xl px-6">
              {children}
              
              {/* todo: sticky footer? */}
              {/* <Footer />  */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;