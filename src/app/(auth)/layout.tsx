import type { ReactNode } from "react";
import { Header } from "../(landing)/_components/header";
import Script from "next/script";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      <div className="grid min-h-screen place-items-center p-4">{children}</div>
    </>
  );
};

export default AuthLayout;
