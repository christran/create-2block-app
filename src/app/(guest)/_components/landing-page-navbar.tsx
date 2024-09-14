"use client"; // Marks this as a client-side component

// Import necessary dependencies and components
import Link from "next/link"
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { APP_TITLE_UNSTYLED, navbarItems, Paths } from "@/lib/constants";
import { CrumpledPaperIcon, LockClosedIcon } from "@radix-ui/react-icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Home, LogIn } from "lucide-react";

// Define the props interface for the DashboardNavbar component

// Define the DashboardNavbar component
export function LandingPageNavbar() {
  const path = usePathname(); // Get the current pathname
  
  return (
    <>
      <nav className="mt-2 flex-1">
        {/* Map through navbar categories */}
        <ul className="flex flex-col gap-2">
         
          <div className="flex flex-col gap-1 mb-1">
            {/* <Separator className="mb-1" /> */}
            {/* Map through category items */}
            <Link href={Paths.Home}>
                      <span
                        className={cn(
                          "flex h-9 items-center justify-between rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-zinc-600/10 dark:hover:bg-zinc-800/70 transition-all hover:text-primary",
                          path === "#" ? "text-primary bg-zinc-600/10 dark:bg-zinc-800/70" : ""
                        )}
                      >
                        <span className="flex items-center">
                          <Home className="mr-2 h-4 w-4" />
                            Home
                        </span>
     
                      </span>
              </Link>
              {/* <Link href={Paths.Login}>
                      <span
                        className={cn(
                          "flex h-9 items-center justify-between rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-zinc-600/10 dark:hover:bg-zinc-800/70 transition-all hover:text-primary",
                          path === "#" ? "text-primary bg-zinc-600/10 dark:bg-zinc-800/70" : ""
                        )}
                      >
                        <span className="flex items-center">
                          <LogIn className="mr-2 h-4 w-4" />
                            Login
                        </span>
     
                      </span>
              </Link> */}
              <Link href="#">
                      <span
                        className={cn(
                          "flex h-9 items-center justify-between rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-zinc-600/10 dark:hover:bg-zinc-800/70 transition-all hover:text-primary",
                          path === "#" ? "text-primary bg-zinc-600/10 dark:bg-zinc-800/70" : ""
                        )}
                      >
                        <span className="flex items-center">
                          <CrumpledPaperIcon className="mr-2 h-4 w-4" />
                            About
                        </span>
     
                      </span>
              </Link>
            
          </div>
        </ul>
      </nav>
    </>
  )
}