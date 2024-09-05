import { APP_TITLE, APP_DESCRIPTION } from "@/lib/constants";
import { type ReactNode } from "react";
import { type Metadata } from "next";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";

function LandingPageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      {/* <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 dark:bg-neutral-950 p-4 md:gap-8 md:p-10"> */}
        {children}
      {/* </main> */}
      <Footer />
    </>
  );
}

export default LandingPageLayout;
