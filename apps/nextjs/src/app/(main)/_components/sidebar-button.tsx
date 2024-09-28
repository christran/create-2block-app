"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@2block/shared/utils";;

interface SidebarToggleProps {
  isClosed: boolean | undefined;
  setIsClosed?: () => void;
}

export function SidebarToggle({ isClosed, setIsClosed }: SidebarToggleProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      // className="absolute w-6 h-6 -right-3 top-[1.1rem] z-40 rounded-lg drop-shadow bg-background/100 dark:border"
      className="absolute w-7 h-7 -right-[0.85rem] top-[1rem] z-40 rounded-lg drop-shadow bg-background/100 dark:border"
      onClick={() => setIsClosed?.()}
    >
    <ChevronLeft 
    className={
      cn("h-4 w-4 transition-transform ease-in-out duration-300", 
        isClosed ? "rotate-180" : "rotate-0")}
    />
    </Button>
  );
}