import { type ReactNode } from "react";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";
import Link from "next/link";
import { PiHandPeaceLight } from "@/components/icons";
import { APP_TITLE_UNSTYLED, Paths } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { DashboardNavbar } from "./dashboard/_components/dashboard-navbar";
import { validateRequest } from "@/lib/auth/validate-request";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UserDropdownNavBar } from "./_components/user-dropdown-navbar";

const MainLayout = async ({ children }: { children: ReactNode }) => {
  const { user } = await validateRequest();

  // Generate a random color for hover effect
  const colors = ['blue', 'teal'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return (
    <div className="flex">
      <nav className="bg-muted/25">
        <aside className="dark:bg-root hidden h-screen w-[250px] flex-shrink-0 flex-col justify-between border-r border-slate-4 bg-slate-1 px-4 pb-6 dark:border-slate-6 md:flex">
          <div className="flex h-[60px] items-center">
            <Link className={`flex items-center text-sm font-bold hover:text-${randomColor}-500`} href={Paths.Dashboard}>
              <PiHandPeaceLight className="h-5 w-5" />{APP_TITLE_UNSTYLED}
            </Link>
            <div className="ml-auto">
            <ThemeToggle />
            </div>
   
          </div>

          <DashboardNavbar userRole={user?.role ?? "default"} />

          {user?.role === "admin" && (
            <Card className="mb-4">
              <CardHeader className="p-4">
                <CardTitle className="text-sm">Upgrade to Pro</CardTitle>
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

          <div>
            <UserDropdownNavBar
              fullname={user?.fullname ?? ''} 
              email={user?.email ?? ''} 
              avatar={user?.avatar ?? ''} 
            />
          </div>
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
        <Header />
        <div className="scrollContainer h-[calc(100vh-60px)] overflow-auto">
          {children}
          
          {/* todo: sticky footer? */}
          {/* <Footer />  */}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
