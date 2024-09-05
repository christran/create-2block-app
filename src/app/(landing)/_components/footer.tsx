import { PiHandPeaceThin } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_TITLE, Paths } from "@/lib/constants";
import Link from "next/link";

const githubUrl = "https://github.com/christran";

export const Footer = () => {
  return (
    <footer className="px-4 py-6 mt-auto">
      <div className="container flex justify-between items-center p-0">
        <div className="flex-1">
          <ThemeToggle />
        </div>
        <p className="text-xs">
          Powered by{" "}
          <a href={githubUrl} className="hover:text-blue-500">
            {APP_TITLE}
          </a>
        </p>
        <div className="flex-1 flex justify-end text-xs gap-2">
          <Link href={Paths.PrivacyPolicy} className="hover:underline hover:text-blue-500">Privacy</Link>
          <Link href={Paths.TermsOfService} className="hover:underline hover:text-blue-500">Terms of Use</Link>
          <Link href={Paths.AcceptableUsePolicy} className="hover:underline hover:text-blue-500">Acceptable Use</Link>
        </div>
      </div>
    </footer>
  )
};
