import "@/styles/globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { APP_TITLE, APP_TITLE_PLAIN } from "@/lib/constants";
import localFont from "next/font/local";
import { TRPCReactProvider } from "@/trpc/react";
import type { Metadata, Viewport } from "next";
import { AnalyticsScript } from "./analytics";
import { validateRequest } from "@/lib/auth/validate-request";
import { cookies } from "next/headers";
import { env } from "@/env";
import { UserProvider } from "@/lib/auth/user-provider";
import { api } from "@/trpc/server";
import type { DatabaseUserAttributes } from "@/lib/auth";
import { User } from "@/server/db/schema";

// const GeistSans = localFont({
//   src: "../../fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });

const Inter = localFont({
  src: "../../public/fonts/Inter.woff2",
  variable: "--font-sans",
  weight: "100 900",
})

// const InterItalic = localFont({
//   src: "../../public/fonts/Inter-Italic.woff2",
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
  const userPromise = validateRequest().then(({ user }) => {
    if (!user) {
      return null;
    }
    return user as User;
  });

  const userData = {
    userId: cookies().get("lastKnownUserId")?.value ?? "N/A",
    email: cookies().get("lastKnownEmail")?.value ?? "N/A"
  };

  return (
    <html lang="en" suppressHydrationWarning className={`${Inter.className} antialiased`}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider userPromise={userPromise}>
            <TRPCReactProvider>{children}</TRPCReactProvider>
          </UserProvider>
          <Toaster position="bottom-right" duration={3500} />
        </ThemeProvider>

        <AnalyticsScript 
          websiteId={env.UMAMI_WEBSITE_ID} 
          userPromise={userPromise}
          lastKnownUserData={userData}
        />
      </body>
    </html>
  );
}
