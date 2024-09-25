import { RateLimited } from "./_components/rate-limited"

export const metadata = {
  title: "Rate Limited",
  description: "You have been rate limited. Please try again later.",
}

export default function BlockedPage() {
  return (
    <RateLimited />
  )
}