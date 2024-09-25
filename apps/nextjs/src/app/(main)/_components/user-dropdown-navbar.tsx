"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth/actions";;
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/next-avatar";
import { Paths } from "@2block/shared/shared-constants";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, CreditCardIcon, EllipsisVertical, LogIn, LogOut, Pencil, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "@/components/icons";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState, Fragment } from "react";
import { SheetClose } from "@/components/ui/sheet";
import { cn } from "@2block/shared/utils";;

interface UserDropdownNavBarProps {
  fullname: string;
  email: string;
  avatar: string;
  withSheetClose: boolean;
  isClosed: boolean;
}

export function UserDropdownNavBar({ fullname, email, avatar, withSheetClose, isClosed }: UserDropdownNavBarProps) {
  const [SheetCloseWrapper, shetCloseWrapperProps] = withSheetClose
    ? [SheetClose, { asChild: true }]
    : [Fragment, {}];

  const { theme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light");
  }, [theme, setTheme]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputActive = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
  
      if ((event.key === "m" || event.key === "M") && !isInputActive) {
        toggleTheme();
      }
    };
  
    window.addEventListener("keydown", handleKeyPress);
  
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [toggleTheme]);

  const handleSignout = async () => {
    try {
      await logout();
      toast.success("You have been successfully signed out.");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const isEmail = (text: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(text);
  };

  const TruncatedText = ({ text, maxWidth, className }: { text: string; maxWidth: string; className: string }) => {
    const ref = useRef<HTMLSpanElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    useEffect(() => {
      const checkTruncation = () => {
        if (ref.current) {
          setIsTruncated(ref.current.scrollWidth > ref.current.clientWidth);
        }
      };

      checkTruncation();
      window.addEventListener("resize", checkTruncation);
      return () => window.removeEventListener("resize", checkTruncation);
    }, [text]);

    const handleCopy = () => {
      navigator.clipboard.writeText(text).then(() => {
        toast.success("Copied to clipboard");
      }).catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy text");
      });
    };

    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              ref={ref}
              className={`${className} truncate`}
              style={{ maxWidth }}
            >
              {text}
            </span>
          </TooltipTrigger>
          {isTruncated && (
            <TooltipContent side="bottom" align="center" className="flex items-center gap-2">
              <span className="font-medium text-sm cursor-pointer" onClick={handleCopy}>{text}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 text-muted-foreground hover:text-primary"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy to clipboard</span>
              </Button>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <>
      {fullname !== "Guest" ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={`cursor-pointer flex h-9 items-center rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-zinc-600/10 dark:hover:bg-zinc-800/70 transition-all duration-200 hover:text-primary ${isClosed ? "justify-center" : "justify-between"}`}>
              <div className={`flex items-center ${isClosed ? "justify-center w-full" : ""}`}>
                <Avatar className={`relative transition-all duration-300 ease-in-out ${isClosed ? "h-8 w-8" : "h-7 w-7"} drop-shadow-md`}>
                  <AvatarImage 
                    src={avatar} 
                    alt={fullname} 
                    className="object-cover" 
                    width={64}
                    height={64}
                  />
                  <AvatarFallback delayMs={100}>
                    {fullname.split(" ").map(name => name.charAt(0).toUpperCase()).join("")}
                  </AvatarFallback>
                </Avatar>
                {!isClosed && (
                  <span className="inline-block ml-2 text-sm truncate max-w-[140px]">
                    {isEmail(fullname) ? email : fullname}
                  </span>
                )}
              </div>
              {!isClosed && <EllipsisVertical className="h-4 w-4 text-muted-foreground ml-2"/>}
              <span className="sr-only">Toggle user menu</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className={cn("w-[230px]", isClosed ? "ml-2" : "")}>
            <DropdownMenuLabel>
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2 drop-shadow-md relative">
                  <AvatarImage 
                    src={avatar} 
                    alt={fullname} 
                    className="object-cover"
                    width={64}
                    height={64}
                  />
                  <AvatarFallback delayMs={100}>
                    {fullname.split(" ").map(name => name.charAt(0).toUpperCase()).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <TruncatedText
                    text={fullname}
                    maxWidth="170px"
                    className="font-semibold text-sm"
                  />
                  <TruncatedText
                    text={email}
                    maxWidth="150px"
                    className="font-medium text-xs text-muted-foreground"
                  />
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer font-medium text-muted-foreground hover:text-primary" onClick={toggleTheme}>
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center">
                  <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 mr-2" />
                  <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 mr-2" />
                  Toggle theme
                </div>
                <kbd className="hidden md:inline-flex rounded-md border border-primary/20 bg-muted px-1.5 h-[22px] w-[22px] font-extrabold text-muted-foreground items-center justify-center select-none uppercase">
                  M
                </kbd>
              </div>
            </DropdownMenuItem>
            <SheetCloseWrapper {...shetCloseWrapperProps} key="billing">
              <Link href={Paths.Billing}>
                <DropdownMenuItem className="cursor-pointer font-medium text-muted-foreground hover:text-primary" asChild>
                  <div className="flex items-center w-full">
                    <CreditCardIcon className="h-4 w-4 mr-2"/>
                    Billing
                  </div>
                </DropdownMenuItem>
              </Link>
            </SheetCloseWrapper>
            <SheetCloseWrapper {...shetCloseWrapperProps} key="settings">
              <Link href={Paths.Settings}>
                <DropdownMenuItem className="cursor-pointer font-medium text-muted-foreground hover:text-primary" asChild>
                  <div className="flex items-center w-full">
                  <Settings2 className="h-4 w-4 mr-2"/>
                  Settings
                  </div>
                </DropdownMenuItem>
              </Link>
            </SheetCloseWrapper>
            <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer font-medium text-muted-foreground hover:text-primary" onClick={handleSignout}>
                <div className="flex items-center w-full">
                  <LogOut className="h-4 w-4 mr-2"/>
                  Logout
                </div>
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={`cursor-pointer flex h-9 items-center rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-zinc-600/10 dark:hover:bg-zinc-800/70 transition-all duration-200 hover:text-primary ${isClosed ? "justify-center" : "justify-between"}`}>
              <div className={`flex items-center ${isClosed ? "justify-center w-full" : ""}`}>
                <Avatar className={`relative transition-all duration-300 ease-in-out ${isClosed ? "h-8 w-8" : "h-7 w-7"} drop-shadow-md`}>
                  <AvatarImage 
                    src={avatar} 
                    alt={fullname} 
                    className="object-cover"
                    width={64}
                    height={64}
                  />
                  <AvatarFallback delayMs={100}>
                    {fullname.split(" ").map(name => name.charAt(0).toUpperCase()).join("")}
                  </AvatarFallback>
                </Avatar>
                {!isClosed && (
                  <span className="inline-block ml-2 text-sm truncate max-w-[140px]">
                    {isEmail(fullname) ? email : fullname}
                  </span>
                )}
              </div>
              {!isClosed && <EllipsisVertical className="h-4 w-4 text-muted-foreground ml-2"/>}
              <span className="sr-only">Toggle user menu</span>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className={cn("w-[230px]", isClosed ? "ml-2" : "")}>
            <DropdownMenuLabel>
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2 drop-shadow-md relative">
                  <AvatarImage 
                    src={avatar} 
                    alt={fullname} 
                    className="object-cover"
                    width={64}
                    height={64}
                  />
                  <AvatarFallback delayMs={100}>
                    {fullname.split(" ").map(name => name.charAt(0).toUpperCase()).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <TruncatedText
                    text={fullname}
                    maxWidth="170px"
                    className="font-semibold text-sm"
                  />
                  <TruncatedText
                    text={email}
                    maxWidth="150px"
                    className="font-medium text-xs text-muted-foreground"
                  />
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer font-medium text-muted-foreground hover:text-primary" onClick={toggleTheme}>
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center">
                  <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 mr-2" />
                  <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 mr-2" />
                  Toggle theme
                </div>
                <kbd className="hidden md:inline-flex rounded-md border bg-muted px-1.5 text-[12px] font-extrabold text-muted-foreground">
                  M
                </kbd>
              </div>
            </DropdownMenuItem>
            <SheetCloseWrapper {...shetCloseWrapperProps} key="register">
              <Link href={Paths.Signup}>
                <DropdownMenuItem className="cursor-pointer font-medium text-muted-foreground hover:text-primary" asChild>
                  <div className="flex items-center w-full">
                    <Pencil className="h-4 w-4 mr-2"/>
                    Register
                  </div>
                </DropdownMenuItem>
              </Link>
            </SheetCloseWrapper>
            <DropdownMenuSeparator />
            <SheetCloseWrapper {...shetCloseWrapperProps} key="login">
              <Link href={Paths.Login}>
                <DropdownMenuItem className="cursor-pointer font-medium text-muted-foreground hover:text-primary" asChild>
                  <div className="flex items-center w-full">
                  <LogIn className="h-4 w-4 mr-2"/>
                  Login
                  </div>
                </DropdownMenuItem>
              </Link>
            </SheetCloseWrapper>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );
};