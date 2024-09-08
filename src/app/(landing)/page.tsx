import { type Metadata } from "next";
import { Button } from "@/components/ui/button";
import { DesktopIcon } from "@radix-ui/react-icons";

import { Paths } from "@/lib/constants";
import Link from "next/link";
import { validateRequest } from "@/lib/auth/validate-request";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to ✌️BLOCK",
};

const HomePage = async () => {
  const { user } = await validateRequest();

  return (
    <>
      <section className="mx-auto grid min-h-[calc(100vh-300px)] max-w-5xl flex-col items-center justify-center gap-4 py-10 text-center md:py-12">
        <div className="p-4">
          {/* <div className="mb-10 flex items-center justify-center font-bold">
            <PiHandPeaceLight className="h-5 w-5" />BLOCK
          </div> */}
          <h1 className="text-balance bg-gradient-to-tr from-black/70 via-black to-black/60 bg-clip-text text-center text-3xl font-bold dark:from-zinc-400/10 dark:via-white/90 dark:to-white/20 sm:text-5xl md:text-6xl lg:text-7xl">
            ✌️BLOCK
          </h1>
          <p className="text-balance mb-10 mt-4 text-center text-muted-foreground md:text-lg lg:text-xl">
            The quick brown fox jumped over the lazy dog.
          </p>
          <div className="flex justify-center gap-4">
            
            <Link href={user ? Paths.Dashboard : Paths.Login}>
              <Button size="lg" variant="outline">
                  <DesktopIcon className="mr-2 h-5 w-5" />
                  Connect
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
