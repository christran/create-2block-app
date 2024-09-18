"use client";

import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
  isClosed: boolean | undefined;
  setIsClosed?: () => void;
}

export function SidebarToggle({ isClosed, setIsClosed }: SidebarToggleProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute w-7 h-7 -right-4 top-4 z-40 rounded-lg shadow"
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