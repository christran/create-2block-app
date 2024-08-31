import { type Metadata } from "next";
import { Button } from "@/components/ui/button";
import { DesktopIcon } from "@radix-ui/react-icons";

import { Paths } from "@/lib/constants";

import {
  NextjsLight,
  NextjsDark,
} from "./_components/feature-icons";

export const metadata: Metadata = {
  title: "✌️BLOCK",
  description:
    "✌️BLOCK",
};

const HomePage = () => {
  return (
    <>
      <section className="mx-auto grid min-h-[calc(100vh-300px)] max-w-5xl flex-col  items-center justify-center gap-4 py-10 text-center  md:py-12">
        <div className="p-4">
          {/* <div className="mb-10 flex items-center justify-center font-bold">
            <PiHandPeaceLight className="h-5 w-5" />BLOCK
          </div> */}
          <h1 className="text-balance bg-gradient-to-tr from-black/70 via-black to-black/60 bg-clip-text text-center text-3xl font-bold dark:from-zinc-400/10 dark:via-white/90 dark:to-white/20 sm:text-5xl md:text-6xl lg:text-7xl">
            ✌️BLOCK
          </h1>
          <p className="text-balance mb-10 mt-4 text-center text-muted-foreground md:text-lg lg:text-xl">
            The quick brown box jumped over the lazy
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="outline" asChild>
              <a href={Paths.Login}>
                <DesktopIcon className="mr-2 h-5 w-5" />
                Connect
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;

function NextjsIcon({ className }: { className?: string }) {
  return (
    <>
      <NextjsLight className={className + " dark:hidden"} />
      <NextjsDark className={className + " hidden dark:block"} />
    </>
  );
}
