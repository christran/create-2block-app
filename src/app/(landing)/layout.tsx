import { type ReactNode } from "react";
import { Header } from "./_components/header";
import { Footer } from "./_components/footer";

function LandingPageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
        {children}
      <Footer />
    </>
  );
}

export default LandingPageLayout;
