"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Home } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function BlockedPage() {
  return (
    <>
      <div className="flex flex-col items-center justify-center mx-auto max-w-5xl px-4 md:px-2 py-48 md:py-72 pb-8">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="text-7xl md:text-9xl font-bold mb-4"
        >
          
          <motion.span
            animate={{ rotate: [0, 1, -1, 0] }}
            transition={{
              repeat: Infinity,
              duration: 5,
              ease: "easeInOut",
            }}
            className="inline-block"
          >
            Rate Limited!
          </motion.span>
          
        </motion.div>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xl md:text-2xl text-center mb-8 max-w-full"
        >
          Slow down! You've been rate limited. Please try again later.
        </motion.div>
        {/* <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            href="/"
            className="flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground rounded-lg shadow text-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            <Home className="mr-2" />
            Return Home
          </Link>
        </motion.div> */}
        <div className="absolute top-0 left-0 m-4">
          {/* <ThemeToggle /> */}
        </div>
      </div>
    </>
  )
}