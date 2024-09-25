"use client"

import Script from "next/script"
import { useEffect, useRef, useState } from "react"
import type { DatabaseUserAttributes } from "@/lib/auth"

interface AnalyticsScriptProps {
  websiteId: string;
  userPromise: Promise<DatabaseUserAttributes | null>;
  lastKnownUserData: Record<string, unknown> | null;
}

export function AnalyticsScript({ websiteId, userPromise, lastKnownUserData }: AnalyticsScriptProps) {
  const [isReady, setIsReady] = useState(false);
  const userDataRef = useRef<Record<string, unknown> | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await userPromise;
      if (user) {
        userDataRef.current = {
          userId: user.id,
          email: user.email,
        };
      } else if (lastKnownUserData) {
        userDataRef.current = lastKnownUserData;
      }
      setIsReady(true);
    };

    fetchUser().catch(console.error);
  }, [userPromise]);

  if (!isReady) {
    return null;
  }

  return (
    <Script
      async
      src="/census.js"
      data-website-id={websiteId}
      onLoad={() => {
        const userData = userDataRef.current;
        if (userData && window.umami) {
          window.umami.identify(userData);
        }
      }}
    />
  )
}

// Add this to ensure TypeScript recognizes the umami property on the window object
declare global {
  interface Window {
    umami?: {
      identify: (data: Record<string, unknown>) => void;
    };
  }
}