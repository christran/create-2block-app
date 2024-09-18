import { type ReactNode } from "react";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";
import Link from "next/link";
import { PiHandPeaceLight } from "@/components/icons";
import { APP_TITLE_UNSTYLED, Paths, dotsBG, gridBG } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { DashboardNavbar } from "./(dashboard)/_components/dashboard-navbar";
import { validateRequest } from "@/lib/auth/validate-request";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UserDropdownNavBar } from "./_components/user-dropdown-navbar";
import { EmailVerificationWarning } from "./(dashboard)/_components/email-verification-warning";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const MainLayout = async ({ children }: { children: ReactNode }) => {
  const { user } = await validateRequest();

  return (
    <div className="flex">
      <nav className="bg-secondary/20">
        <aside className="dark:bg-root hidden h-screen w-[250px] flex-shrink-0 flex-col justify-between border-r px-4 pb-6 md:flex">
          <div className="flex h-[60px] items-center">
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link className={"flex items-center text-lg font-extrabold text-primary/75 hover:text-yellow-400/90"} href={Paths.Dashboard}>
                    <PiHandPeaceLight className="h-7 w-7" />{APP_TITLE_UNSTYLED}
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="font-bold text-xs">
                    ✌️BLOCK!
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="ml-auto">
            {/* <ThemeToggle /> */}
            </div>
   
          </div>

          <DashboardNavbar userRole={user?.role ?? "default"} />

          {user?.role === "default" && (
            <Card className="mb-4">
              <CardHeader className="p-4">
                <CardTitle className="text-sm flex items-center gap-1">
                  Upgrade to Pro
                  {/* <Badge variant="default" className="cursor-pointer text-[9px] px-1.5 py-0.1 rounded-lg font-extrabold text-yellow-400 hover:text-yellow-500 dark:text-yellow-500 bg-primary/75 dark:bg-accent/50 hover:bg-yellow-400/15 dark:hover:bg-yellow-400/20">
                    Pro
                  </Badge> */}
                </CardTitle>
                <CardDescription className="text-xs">
                  Unlock all features and get unlimited access to everything.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <Link href={Paths.Billing}>
                  <Button size="sm" className="w-full text-xs">
                    Upgrade
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <UserDropdownNavBar
            fullname={user?.fullname ?? ""} 
            email={user?.email ?? ""} 
            avatar={user?.avatar ?? ""} 
            withSheetClose={false}
          />

          {/* <div className="flex items-center justify-between pt-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div> */}
        </aside>
      </nav>

      <div className="w-full">
        <Header
          fullname={user?.fullname ?? ""} 
          email={user?.email ?? ""} 
          avatar={user?.avatar ?? ""}
          userRole={user?.role ?? "guest"} 
        />
        <div className={`scrollContainer h-[calc(100vh-60px)] md:overflow-auto ${dotsBG}`}>
          {user?.emailVerified === false && (
            <div className="mx-auto pt-8">
              <div className="flex flex-col gap-6 mx-auto max-w-5xl px-4 md:px-2">
                <EmailVerificationWarning />
              </div>
            </div>
          )}

          {children}
          
          {/* todo: sticky footer? */}
          {/* <Footer />  */}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
