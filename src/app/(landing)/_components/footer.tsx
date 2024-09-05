import { ThemeToggle } from "@/components/theme-toggle";
import { APP_TITLE, Paths } from "@/lib/constants";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";


const githubUrl = "https://github.com/christran";

export const Footer = () => {
  return (
    <footer className="px-4 py-6 mt-auto">
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
        <div className="flex-1 flex justify-end text-xs">
          <div className="flex items-center space-x-2">
            <Link href={Paths.PrivacyPolicy} className="hover:underline hover:text-teal-500">Privacy</Link>
            <Separator orientation="vertical" className="h-4" />
            <Link href={Paths.TermsOfService} className="hover:underline hover:text-teal-500">Terms of Service</Link>
            <Separator orientation="vertical" className="h-4" />
            <Link href={Paths.AcceptableUsePolicy} className="hover:underline hover:text-teal-500">Acceptable Use</Link>
          </div>
        </div>
      </div>
    </footer>
  )
};
