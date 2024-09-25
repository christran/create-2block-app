import { ThemeToggle } from "@/components/theme-toggle";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { APP_TITLE, Paths } from "@2block/shared/shared-constants";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="py-4 px-4 lg:px-6 text-muted-foreground/75">
      <div className="container flex flex-col items-center p-0">
        <div className="w-full flex justify-between items-center mb-2">
          <div className="flex-1">
            {/* <ThemeToggle /> */}
          </div>
            <TooltipProvider delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                <p className="text-xs">
                  Powered by{" "}
                  <a href={Paths.GitHub} className="hover:text-blue-500">
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
          <Link href={Paths.PrivacyPolicy} className="hover:underline hover:text-blue-500" prefetch={false}>Privacy</Link>
          <Separator orientation="vertical" className="h-4" />
          <Link href={Paths.TermsOfService} className="hover:underline hover:text-blue-500" prefetch={false}>Terms of Service</Link>
          <Separator orientation="vertical" className="h-4" />
          <Link href={Paths.AcceptableUsePolicy} className="hover:underline hover:text-blue-500" prefetch={false}>Acceptable Use</Link>
        </div>
      </div>
    </footer>
  )
};