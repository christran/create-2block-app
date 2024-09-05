import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { APP_TITLE, Paths } from "@/lib/constants";
import Link from "next/link";

const githubUrl = "https://github.com/christran";

export const Footer = () => {
  return (
    <footer className="px-4 py-6 mt-auto dark:bg-neutral-950 text-muted-foreground/90">
      <div className="container flex flex-col items-center p-0">
        <div className="w-full flex justify-between items-center mb-2">
          <div className="flex-1">
            <ThemeToggle />
          </div>
            <TooltipProvider delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                <p className="text-xs">
                  Powered by{" "}
                  <a href={githubUrl} className="hover:text-blue-500">
                    {APP_TITLE}
                  </a>
                </p>
              </TooltipTrigger>
              <TooltipContent className="font-bold text-sm">
                  ✌️BLOCK
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex-1"></div>
        </div>
        <div className="flex gap-3 text-[0.7rem]">
          <Link href={Paths.PrivacyPolicy} className="hover:underline hover:text-blue-500">Privacy</Link>
          <Separator orientation="vertical" className="h-4" />
          <Link href={Paths.TermsOfService} className="hover:underline hover:text-blue-500">Terms of Service</Link>
          <Separator orientation="vertical" className="h-4" />
          <Link href={Paths.AcceptableUsePolicy} className="hover:underline hover:text-blue-500">Acceptable Use</Link>
        </div>
      </div>
    </footer>
  )
};