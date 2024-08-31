import type { ReactNode } from "react";
import { Header } from "../(landing)/_components/header";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      <div className="grid place-items-center p-20">
        {children}
      </div>
    </>
  );
};

export default AuthLayout;
