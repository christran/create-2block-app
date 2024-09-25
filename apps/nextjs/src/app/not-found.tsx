"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Home } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Paths } from "@2block/shared/shared-constants"

export default function NotFoundPage() {
  return (
    <>
      <div className="flex flex-col items-center justify-center mx-auto max-w-5xl px-4 md:px-2 py-48 md:py-80 pb-8">
        <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
            className="text-8xl md:text-9xl font-bold mb-4"
          >
            4
            <motion.span
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
              className="inline-block"
            >
              0
            </motion.span>
            4
          </motion.div>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-center mb-8 max-w-full"
          >
            Oops! This page does not exist
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => window.location.replace(Paths.Home)}
              size="lg"
              className="flex items-center justify-center px-8 py-6 bg-primary text-primary-foreground rounded-lg shadow text-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              <Home className="mr-2" />
              Return Home
            </Button>
          </motion.div>
        <div className="absolute top-0 left-0 m-4">
          <ThemeToggle />
        </div>
      </div>
    </>
  )
}