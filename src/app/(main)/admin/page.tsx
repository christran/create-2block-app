import { redirect } from "next/navigation";
import { env } from "@/env";
import { type Metadata } from "next";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  title: "Admin Panel",
  description: "Admin Panel",
};

export default async function AdminPage() {
  const { user } = await validateRequest();
  
  if (!user) redirect(Paths.Login);
  if (user?.role !== "admin") redirect(Paths.Dashboard);

  return (
    <>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center">
          <h1 className="text-[28px] leading-[34px] tracking-[-0.416px] text-slate-12 font-bold">Admin Panel</h1>
        </div>
      </div>
      
      <div className="flex flex-col gap-6 mx-auto max-w-5xl px-6">
        <Card>
          <CardHeader>
            <CardTitle>Posts</CardTitle>
            <CardDescription>
              
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              There should be something here
            </h3>
            <p className="text-sm text-muted-foreground">
              Maybe some posts?
            </p>
          {/* <Suspense fallback={<PostsSkeleton />}>
              <Posts promises={promises} />
          </Suspense> */}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
