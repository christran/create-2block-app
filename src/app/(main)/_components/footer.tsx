import { PiHandPeaceThin } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { APP_TITLE } from "@/lib/constants";

const githubUrl = "https://github.com/christran";

export const Footer = () => {
  return (
    <footer className="px-4 py-6 dark:bg-neutral-950">
      <div className="container flex justify-between items-center p-0">
        <div className="flex-1">
          <ThemeToggle />
        </div>
        <TooltipProvider delayDuration={400}>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-xs">
                Powered by{" "}
                <a href={githubUrl} className="hover:text-teal-500">
                  {APP_TITLE}
                </a>
              </p>
              </TooltipTrigger>
              <TooltipContent className="font-bold text-sm">
                ✌️BLOCK
              </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <div className="flex-1" />
      </div>
    </footer>
  );
};
