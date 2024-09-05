import { APP_TITLE, APP_DESCRIPTION } from "@/lib/constants";
import { type ReactNode } from "react";
import { type Metadata } from "next";
import { Header } from "../_components/header";
import { Footer } from "../_components/footer";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: APP_DESCRIPTION,
};

function LegalPageLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}

export default LegalPageLayout;
