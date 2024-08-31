import Link from "next/link";
import { PiHandPeaceLight } from "@/components/icons";
import { APP_TITLE_UNSTYLED, Paths } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DesktopIcon, HamburgerMenuIcon, PersonIcon } from "@radix-ui/react-icons";

const routes = [
  { name: "Home", href: "/" },
  { name: "Team", href: "/#features" },
  {
    name: "Jobs",
    href: "https://google.com",
  },
] as const;

export const Header = () => {
  return (
    <header className="sticky top-0 z-10 border-b-2 border-gray-200">
      <div className="container flex items-center gap-2 px-2 py-2 lg:px-4">
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
                  <Link href={href}>{name}</Link>
                </DropdownMenuItem>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Link
          className="flex items-center justify-center text-xs font-bold"
          href="/"
        >
          <PiHandPeaceLight className="h-5 w-5" />{APP_TITLE_UNSTYLED}
        </Link>
        <nav className="ml-8 hidden gap-4 sm:gap-6 md:flex">
          {routes.map(({ name, href }) => (
            <Link
              key={name}
              className="text-sm font-medium text-muted-foreground/80 transition-colors hover:text-muted-foreground"
              href={href}
            >
              {name}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <Button size="sm" variant="outline" asChild>
            <a href={Paths.Login}>
              <PersonIcon className="mr-2 h-5 w-5" />
              Login
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
};
