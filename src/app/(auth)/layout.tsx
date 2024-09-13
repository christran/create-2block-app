import type { ReactNode } from "react";
import { Header } from "../(landing)/_components/header";
import { Footer } from "../(landing)/_components/footer";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      <div className="grid place-items-center pt-20">
        {children}
      </div>
      {/* <Footer /> */}
    </>
  );
};

export default AuthLayout;
