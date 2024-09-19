import { redirect } from "next/navigation";
import { env } from "@/env";
import { type Metadata } from "next";
import { validateRequest } from "@/lib/auth/validate-request";
import { Paths } from "@/lib/constants";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { db } from "@/server/db";

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
      <div className="mx-auto max-w-5xl px-4 md:px-2 py-8">
        <div className="flex items-center">
          <h1 className="text-[28px] leading-[34px] tracking-[-0.416px] text-slate-12 font-bold">Admin Panel</h1>
        </div>
      </div>
      
      <div className="flex flex-col gap-6 mx-auto max-w-5xl px-4 md:px-2 pb-8">
        {/* TODO: move each card into its own component */}
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>
              Manage users across the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              Hi {user.fullname}
            </h3>
            <p className="text-sm text-muted-foreground">
              {db.query.users.findMany().then((users) => {
                const count = users.length;
                
                return `There ${count === 1 ? "is" : "are"} ${count} registered user${count === 1 ? "" : "s"}`;
              })}
            </p>
          {/* <Suspense fallback={<PostsSkeleton />}>
              <Posts promises={promises} />
          </Suspense> */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              View and manage orders
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <h3 className="text-2xl font-bold tracking-tight">
              No orders yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Surely there are some orders...
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
