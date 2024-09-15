import { type Metadata } from "next";
import { Button } from "@/components/ui/button";
import { DesktopIcon } from "@radix-ui/react-icons";

import { Paths } from "@/lib/constants";
import Link from "next/link";
import { validateRequest } from "@/lib/auth/validate-request";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to ✌️BLOCK",
};

const HomePage = async () => {
  const { user } = await validateRequest();

  return (
      <div className="flex flex-col mx-auto max-w-5xl px-4 md:px-2 mt-48 md:mt-60">
          <h1 className="text-6xl md:text-7xl font-extrabold text-primary/90 text-center">
            ✌️BLOCK
          </h1>
          <p className="py-4 text-sm md:text-xl text-center text-muted-foreground">
            The quick brown fox jumped over the lazy dog.
          </p>
          <div className="flex justify-center gap-4">
            
            <Link href={user ? Paths.Dashboard : Paths.Login}>
              <Button size="lg" variant="outline" className="shadow-lg">
                <DesktopIcon className="mr-2 h-5 w-5" />
                Connect
              </Button>
            </Link>
          </div>

      </div>
  );
};

export default HomePage;
