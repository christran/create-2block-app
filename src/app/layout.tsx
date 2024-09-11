import "@/styles/globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { APP_TITLE, APP_TITLE_PLAIN } from "@/lib/constants";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";
import { TRPCReactProvider } from "@/trpc/react";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AnalyticsScript } from "./analytics";
import { validateRequest } from "@/lib/auth/validate-request";
import { cookies } from "next/headers";

// const GeistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });

const Inter = localFont({
  src: "./fonts/Inter.woff2",
  variable: "--font-sans",
  weight: "100 900",
})

// const InterItalic = localFont({
//   src: "./fonts/Inter-Italic.woff2",
//   variable: "--font-sans",
//   weight: "100 900",
//   style: "italtic"
// })

export const metadata: Metadata = {
  title: {
    default: APP_TITLE,
    template: `%s - ${APP_TITLE_PLAIN}`,
  },
  description: "✌️BLOCK",
  icons: [{ rel: "icon", url: "/icon.png", sizes: "32x32" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await validateRequest();

  return (
    <html lang="en" suppressHydrationWarning className={`${Inter.className} antialiased`}>
      <body
        className={cn(
          "flex flex-col min-h-screen dark:bg-neutral-950"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster position="bottom-right" duration={3500} />
        </ThemeProvider>

      {/* 
      - umami analytics 
      - password-reset is getting sent along with the verificationToken which is bad
      */}
      <AnalyticsScript userId={user?.id || cookies().get("lastKnownUserId")?.value || 'N/A'} email={user?.email || cookies().get("lastKnownEmail")?.value || 'N/A'} />
      </body>
    </html>
  );
}
