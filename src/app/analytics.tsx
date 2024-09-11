'use client'

import Script from "next/script"

interface AnalyticsScriptProps {
  websiteId: string;
  userData: Record<string, unknown>;
}

export function AnalyticsScript({ websiteId, userData }: AnalyticsScriptProps) {
  return (
    <Script
      async
      src="/census.js"
      data-website-id={websiteId}
      onLoad={() => {
        if (userData) {
          (window as any).umami.identify(userData);
        }
      }}
    />
  )
}