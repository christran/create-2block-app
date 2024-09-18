"use client"

import { PiHandPeaceLight } from "@/components/icons";
import { APP_TITLE_UNSTYLED, Paths } from "@/lib/constants";
import { UserDropdownHeader } from "@/app/(main)/_components/user-dropdown-header";
import { validateRequest } from "@/lib/auth/validate-request";
import Link from "next/link"
import { MobileSheetNavbar } from "./mobile-sheet-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquareText, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { User } from "@/server/db/schema";

type UserRole = User['role'];

interface HeaderProps {
  fullname: string,
  email: string,
  avatar: string,
  userRole: UserRole;
}

export const Header = ({ fullname, email, avatar, userRole }: HeaderProps) => {
  const SearchForm = () => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
  
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          setIsFocused(true);
          inputRef.current?.focus();
        } else if (e.key === "Escape" && isFocused) {
          e.preventDefault();
          inputRef.current?.blur();
          setIsFocused(false);
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isFocused]);
  
    return (
      <form className="w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search"
            className="w-full appearance-none bg-secondary/30 pl-8 shadow-none"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          {!isFocused && (
            <kbd className="pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 inline-flex items-center justify-center rounded border border-primary/5 bg-muted px-1.5 font-mono text-[14px] font-medium text-muted-foreground/90">
              <span className="text-xs">⌘</span>
              <span className="text-sm px-1">+</span>
              <span className="text-sm">K</span>
            </kbd>
          )}
        </div>
      </form>
    );
  };

  return (
    <header className="flex h-[60px] items-center justify-between border-b px-2 md:px-4 bg-background/85 backdrop-blur-sm sticky top-0 z-30">
      <MobileSheetNavbar 
        fullname={fullname ?? ''} 
        email={email ?? ''} 
        avatar={avatar ?? ''} 
        userRole={userRole ?? "guest"} 
      />
      <div className="hidden w-full items-center md:flex">
        <div className="flex-1">
        
        </div>
        <SearchForm />
        <div className="flex-1 flex justify-end">
          <Link href={Paths.GitHub}>
            <Button variant="outline" className="text-muted-foreground text-xs font-semibold shadow">
              <span className="inline-flex items-center justify-center gap-1 truncate">
                <MessageSquareText className="h-4 w-4" />
                Support
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};