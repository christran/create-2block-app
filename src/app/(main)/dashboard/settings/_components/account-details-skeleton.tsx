import { CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AccountDetailsSkeleton() {
  return (
    <div className="w-full md:w-1/2 space-y-2">
      <CardContent>
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-7 w-24" />
      </CardContent>
    </div>
  )
}