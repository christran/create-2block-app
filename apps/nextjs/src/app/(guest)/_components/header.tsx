import Link from "next/link";
import { PiHandPeaceLight } from "@/components/icons";
import { APP_TITLE_UNSTYLED, Paths } from "@2block/shared/shared-constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DesktopIcon, HamburgerMenuIcon, PersonIcon } from "@radix-ui/react-icons";
import { validateRequest } from "@/lib/auth/validate-request";

const routes = [
  { 
    name: "Home", 
    href: Paths.Home 
  },
  { 
    name: "Login", 
    href: Paths.Login 
  },
] as const;

export const Header = async () => {
  const { user } = await validateRequest();

  return (
    <header className="sticky top-0 flex h-16 items-center justify-between border-b bg-background/85 backdrop-blur-sm px-4 md:px-10">
      <div className="container flex items-center justify-between gap-2 px-2 py-2 lg:px-4">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="focus:outline-none focus:ring-1 md:hidden"
                size="icon"
                variant="outline"
              >
                <HamburgerMenuIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <div className="py-1">
                {routes.map(({ name, href }) => (
                  <DropdownMenuItem key={name} asChild>
                    <Link href={href} className="hover:bg-zinc-600/10 dark:hover:bg-zinc-800/70 hover:text-secondary-foreground">{name}</Link>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link 
            className={`flex items-center justify-center text-xs font-bold hover:text-yellow-500`} 
            href="/"
          >
            <PiHandPeaceLight className="h-5 w-5" />{APP_TITLE_UNSTYLED}
          </Link>
          {/* <nav className="ml-8 hidden gap-4 sm:gap-6 md:flex">
            {routes.map(({ name, href }) => (
              <Link
                key={name}
                className="text-sm font-medium text-muted-foreground/80 transition-colors hover:text-muted-foreground"
                href={href}
              >
                {name}
              </Link>
            ))}
          </nav> */}
        </div>
          <Button size="sm" variant="outline" asChild>
            {user ? (
              <Link href={Paths.Dashboard}>
                <DesktopIcon className="mr-1 h-4 w-4" />
                Connect
              </Link>
            ) : (
              <Link href={Paths.Login}>
                <PersonIcon className="mr-1 h-4 w-4" />
                Login
              </Link>
            )}
          </Button>
      </div>
    </header>
  );
};
