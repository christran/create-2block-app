"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollapseButtonProps {
  isCollapsed: boolean;
  onClick: () => void;
}

export function CollapseButton({ isCollapsed, onClick }: CollapseButtonProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute w-8 h-8 -right-4 top-11 z-40 rounded-lg shadow transition-all duration-300 ease-in-out"
      onClick={onClick}
    >
      {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
    </Button>
  );
}