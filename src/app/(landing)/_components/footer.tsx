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
      <div className="container flex flex-col items-center sm:items-stretch sm:flex-row sm:justify-between p-0 space-y-4 sm:space-y-0">
        <div className="w-full relative flex items-center sm:w-1/3 sm:justify-start">
          <div className="z-10">
            <ThemeToggle />
          </div>
          <div className="absolute inset-0 flex justify-center items-center sm:hidden">
            <TooltipProvider delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs whitespace-nowrap">
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
          </div>
        </div>
        <div className="hidden sm:flex sm:w-1/3 justify-center items-center">
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
        </div>
        <div className="w-full sm:w-1/3 flex justify-center sm:justify-end items-center space-x-2 text-xs">
          <Link href={Paths.PrivacyPolicy} className="hover:underline hover:text-teal-500">Privacy</Link>
          <Separator orientation="vertical" className="h-4" />
          <Link href={Paths.TermsOfService} className="hover:underline hover:text-teal-500">Terms of Service</Link>
          <Separator orientation="vertical" className="h-4" />
          <Link href={Paths.AcceptableUsePolicy} className="hover:underline hover:text-teal-500">Acceptable Use</Link>
        </div>
      </div>
    </footer>
  )
};
