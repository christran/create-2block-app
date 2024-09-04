import { PiHandPeaceThin } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_TITLE } from "@/lib/constants";

const githubUrl = "https://github.com/christran";

export const Footer = () => {
  return (
    <footer className="px-4 py-6 dark:bg-neutral-950">
      <div className="container flex justify-between items-center p-0">
        <div className="flex-1">
          <ThemeToggle />
        </div>
        <p className="text-xs">
          Powered by{" "}
          <a href={githubUrl}>
            {APP_TITLE}
          </a>
        </p>
        <div className="flex-1" />
      </div>
    </footer>
  );
};
