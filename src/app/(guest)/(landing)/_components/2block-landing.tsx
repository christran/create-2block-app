"use client";

import { Button } from "@/components/ui/button";
import { DesktopIcon } from "@radix-ui/react-icons";

import { Paths } from "@/lib/constants";
import Link from "next/link";
import { BorderBeam } from "@/components/border-beam";
import { motion } from "framer-motion";
import { useUser } from "@/lib/auth/user-provider";

const waveAnimation = {
  rotate: [0, -25, 15, -20, 0],
  transition: { 
    duration: 1, 
    ease: "easeInOut",
    repeat: Infinity,
    repeatType: "loop",
    repeatDelay: 5
  }
};

export function TwoBlockLanding() {
  const user = useUser();

  return (
    <div className="flex flex-col mx-auto max-w-5xl px-4 md:px-2 mt-48 md:mt-60">
    <h1 className="text-7xl md:text-8xl font-extrabold text-primary/90 text-center">
      <motion.span
        animate={waveAnimation}
        className="inline-block"
      >
        ✌️
      </motion.span>
      BLOCK
    </h1>
    <p className="py-4 text-sm md:text-xl text-center text-muted-foreground">
      The quick brown fox jumped over the lazy dog.
    </p>
    <div className="flex justify-center gap-4">


      <Link href={user ? Paths.Dashboard : Paths.Login}>
        <Button size="lg" variant="outline" className="border-none shadow-lg relative">
          <DesktopIcon className="mr-2 h-5 w-5" />
          Connect
          <BorderBeam size={70} borderWidth={1} duration={3} delay={9} opacity={0.35} className="z-50"/>
        </Button>
      </Link>
    </div>
</div>
  )
}