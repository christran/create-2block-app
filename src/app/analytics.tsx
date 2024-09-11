'use client'

import Script from "next/script"

interface AnalyticsScriptProps {
  userId: string,
  email: string
}

export function AnalyticsScript({ userId, email }: AnalyticsScriptProps) {
  return (
    <Script
      async
      src="/census.js"
      data-website-id="1b28736f-b351-4b3a-8659-44dae398f196"
      onLoad={() => {
        (window as any).umami.identify({ userId, email })
      }}
    />
  )
}