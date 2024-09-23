import { type Metadata } from "next";
import { TwoBlockLanding } from "./_components/2block-landing";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to ✌️BLOCK",
};

const LandingPage = async () => {

  return (
    <TwoBlockLanding />
  );
};

export default LandingPage;
